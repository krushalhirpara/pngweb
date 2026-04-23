import { useState } from 'react'


function ImageCard({ item, index }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Image URL logic
  const getImageUrl = () => {
    if (hasError || !item.imageUrl) {
      return `https://placehold.co/600x400/f1f5f9/64748b?text=Image+Unavailable`;
    }
    
    // If it's an absolute URL already, use it
    if (item.imageUrl.startsWith('http')) {
      return item.imageUrl;
    }

    // For local assets or relative paths
    return item.imageUrl;
  }

  const finalImageUrl = getImageUrl();

  return (
    <article
      className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
      style={{ animationDelay: `${(index % 8) * 100}ms` }}
    >
      {/* ✅ OPEN DETAIL PAGE IN NEW TAB */}
      <a
        href={`/image/${item.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block cursor-pointer p-4"
      >
        <div
          className="relative flex h-64 items-center justify-center overflow-hidden rounded-xl p-8 checkerboard"
        >
          {!isLoaded && (
            <div className="shimmer absolute inset-0 bg-slate-100 dark:bg-slate-800" />
          )}

          <img
            src={finalImageUrl}
            alt={item.title || "PNGWALE Image"}
            className={`h-full w-full object-contain transition-all duration-700 group-hover:scale-110 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            draggable="false"
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              console.error("Image Load Failed:", item.imageUrl);
              setHasError(true);
            }}
          />
        </div>

        <div className="mt-4 px-1">
          <p className="line-clamp-1 text-base font-bold tracking-tight text-slate-900 transition-colors group-hover:text-blue-600">
            {item.title}
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-widest text-slate-400">
            {item.category}
          </p>
        </div>
      </a>
    </article>
  )
}

export default ImageCard