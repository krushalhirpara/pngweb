import { useState } from 'react'

const transparentGridStyle = {
  backgroundColor: '#f8fafc',
  backgroundImage:
    'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
  backgroundSize: '24px 24px',
  backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px',
}

function ImageCard({ item, index }) {
  const [isLoaded, setIsLoaded] = useState(false)

  // Image URL (for preview only)
  const imageUrl = item.isLocal
    ? item.imageUrl
    : `https://pngweb-production.up.railway.app${item.imageUrl}`

  return (
    <article
      className="animate-fade-in-up group overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-sm ring-1 ring-brand-500/5 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      style={{ animationDelay: `${(index % 8) * 100}ms` }}
    >
      {/* ✅ OPEN DETAIL PAGE IN NEW TAB */}
      <a
        href={`/image/${item.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-left cursor-pointer"
      >
        <div
          className="relative flex h-60 items-center justify-center overflow-hidden p-6"
          style={transparentGridStyle}
        >
          {!isLoaded && (
            <div className="shimmer absolute inset-0 bg-slate-100 dark:bg-slate-800" />
          )}

          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

          <img
            src={imageUrl}
            alt={item.title}
            className={`h-full w-full object-contain transition-all duration-700 group-hover:scale-110 ${isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            loading="lazy"
            draggable="false"
            onLoad={() => setIsLoaded(true)}
          />
        </div>

        <div className="p-5">
          <p className="line-clamp-1 text-sm font-bold tracking-tight text-slate-900 transition-colors group-hover:text-brand-500 dark:text-slate-100">
            {item.title}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {item.category}
          </p>
        </div>
      </a>
    </article>
  )
}

export default ImageCard