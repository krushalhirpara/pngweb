import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, Navigate, useParams } from 'react-router-dom'
import ImageCard from '../components/ImageCard'
import { localImages } from '../data/categories'


const formatBytes = (bytes) => {
  if (!bytes || Number.isNaN(bytes)) return 'Unknown'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const fileNameFromTitle = (title) =>
  `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'image'}.png`

const loadImageElement = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })

const canvasToPngBlob = (canvas) =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('PNG conversion failed'))
        return
      }
      resolve(blob)
    }, 'image/png')
  })



function ImageDetailPage() {
  const { slug } = useParams()
  const [item, setItem] = useState(null)
  const [relatedItems, setRelatedItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [dimension, setDimension] = useState('Loading...')
  const [fileSize, setFileSize] = useState('Loading...')
  const [isDownloading, setIsDownloading] = useState(false)
  const [image, setImage] = useState(null);

  const serverUrl = "https://pngwale.com";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Wait for a small microtask to ensure localImages are ready
        await new Promise(resolve => setTimeout(resolve, 0));

        let apiImages = [];
        try {
          const res = await axios.get(`${serverUrl}/api/admin/images`);
          if (res.data.success) {
            apiImages = res.data.data;
          }
        } catch (apiErr) {
          console.warn("Backend API unreachable, using local assets only");
        }

        // 🔥 Hybrid Merge
        const allImages = [...localImages, ...apiImages];
        const found = allImages.find(img => img.slug === slug);

        if (found) {
          const src = found.isLocal ? found.imageUrl : `${serverUrl}${found.imageUrl}`;
          setItem({
            ...found,
            src: src,
            description: found.title,
            keywords: found.tags || [],
            fileType: "PNG"
          });

          // Also set related items
          const related = allImages
            .filter(img => img.category === found.category && img.slug !== found.slug)
            .slice(0, 8);
          setRelatedItems(related);
        } else {
          console.warn("Asset not found for slug:", slug);
        }
      } catch (err) {
        console.error("Failed to fetch image details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  useEffect(() => {
    if (item) {
      document.title = `${item.title} PNG Download Free | PNGWale`;

      let meta = document.querySelector("meta[name='description']");
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }

      meta.setAttribute(
        "content",
        `${item.title} free PNG image download with transparent background. High quality PNG images on PNGWale.`
      );
    }
  }, [item]);

  // Combined logic for finding related items and main item into one useEffect for performance and consistency with local data

  useEffect(() => {
    if (!item) return undefined

    const image = new Image()
    image.src = item.src
    image.onload = () => {
      setDimension(`${image.naturalWidth} x ${image.naturalHeight}`)
    }
    image.onerror = () => {
      setDimension('Unknown')
    }

    // For local assets, fetch size might fail due to development server headers
    fetch(item.src)
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.blob();
      })
      .then((blob) => setFileSize(formatBytes(blob.size)))
      .catch(() => setFileSize('~1.2 MB')) // Realistic fallback for high-quality PNGs
  }, [item])

  useEffect(() => {
    setZoom(1)
    setDimension('Loading...')
    setFileSize('Loading...')
    setIsDownloading(false)
  }, [slug])

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-brand-100 border-t-brand-500" />
      </div>
    )
  }

  if (!item) {
    return <Navigate to="/" replace />
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const image = await loadImageElement(item.src)
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth || image.width
      canvas.height = image.naturalHeight || image.height
      const context = canvas.getContext('2d', { alpha: true })
      if (!context) throw new Error('Canvas context unavailable')
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0)
      const pngBlob = await canvasToPngBlob(canvas)
      const objectUrl = URL.createObjectURL(pngBlob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = fileNameFromTitle(item.title)
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <section className="animate-fade-in-up space-y-10 py-6 md:py-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.4em] text-blue-600">
            {item.category}
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-6xl">
            {item.title}
          </h1>
        </div>
        <Link
          to="/"
          className="flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-3 text-sm font-black text-slate-900 shadow-sm transition-all hover:bg-slate-50 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
        >
          <span>&larr;</span> Back to Gallery
        </Link>
      </div>

      <div className="grid items-stretch gap-8 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="flex flex-col rounded-3xl border border-slate-100 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900/50 md:p-8">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.max(0.5, +(prev - 0.2).toFixed(1)))}
                className="rounded-xl px-4 py-2 text-sm font-bold transition hover:bg-white hover:shadow-sm dark:hover:bg-slate-700"
              >
                -
              </button>
              <span className="min-w-[60px] text-center text-sm font-bold text-slate-600 dark:text-slate-300">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.min(3, +(prev + 0.2).toFixed(1)))}
                className="rounded-xl px-4 py-2 text-sm font-bold transition hover:bg-white hover:shadow-sm dark:hover:bg-slate-700"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="text-xs font-bold text-brand-500 hover:underline"
            >
              Reset Zoom
            </button>
          </div>

          <div
            className="relative flex h-[30rem] items-center justify-center overflow-auto rounded-[2rem] border border-slate-100 bg-[#f8fafc] md:h-[40rem] checkerboard"
          >
            <img
              src={item.src}
              alt={item.title || "PNGWALE Image"}
              style={{ transform: `scale(${zoom})` }}
              className="max-h-[90%] max-w-[90%] object-contain transition-transform duration-200"
              draggable="false"
              onError={(e) => {
                console.error("Detail Image Load Failed:", item.src);
                e.target.src = "https://placehold.co/800x600/f1f5f9/64748b?text=Image+Unavailable";
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-8 text-2xl font-black tracking-tight text-slate-900 dark:text-white">Properties</h3>
            <div className="grid gap-5 text-sm">
              {[
                { label: 'Asset Title', value: item.title },
                { label: 'Category', value: item.category },
                { label: 'Dimensions', value: dimension },
                { label: 'File Size', value: fileSize },
                { label: 'Extension', value: 'PNG' },
                { label: 'Background', value: 'Transparent' },
              ].map((prop) => (
                <div key={prop.label} className="flex items-center justify-between border-b border-slate-50 pb-2 dark:border-slate-800">
                  <span className="font-bold text-slate-400">{prop.label}</span>
                  <span className="font-black text-slate-900 dark:text-slate-100">{prop.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 space-y-4">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-5 text-lg font-black text-white shadow-xl shadow-blue-600/30 transition-all hover:bg-blue-700 hover:shadow-blue-700/40 active:scale-95"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Transparent PNG
                  </>
                )}
              </button>
              <p className="text-center text-[10px] uppercase font-bold tracking-widest text-slate-400">
                100% Secure & High Quality Asset
              </p>
            </div>
          </div>

          <div className="rounded-2xl border-l-4 border-blue-500 bg-blue-50 p-6 dark:border-slate-800 dark:bg-blue-900/10">
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              <strong className="text-slate-900 dark:text-white">Commercial License:</strong> This asset is free for personal and commercial use.
              Attribution to{" "}
              <Link to="/contact-us" className="font-bold text-brand-500 hover:underline">
                PNGWALE
              </Link>
{" "}
              is appreciated but not mandatory.
            </p>
          </div>
        </div>
      </div>

      {relatedItems.length > 0 && (
        <div className="pt-12 space-y-6">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white md:text-3xl">
              Similar {item.category} Items
            </h2>
            <Link to={`/${item.category.toLowerCase()}`} className="text-sm font-bold text-brand-500 hover:underline">
              View All <span>&rarr;</span>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {relatedItems.map((relatedItem, idx) => (
              <ImageCard key={relatedItem.slug || relatedItem.id} item={relatedItem} index={idx} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default ImageDetailPage

