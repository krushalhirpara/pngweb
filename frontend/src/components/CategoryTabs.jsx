import { NavLink } from 'react-router-dom'

function CategoryTabs({ categories, activeCategory }) {
  const getCategoryLink = (category) => {
    if (category === 'All') return '/';
    return `/${category.toLowerCase().replace(/\s+/g, '-')}`;
  }

  return (
    <div className="mb-10 w-full overflow-hidden">
      {/* 
          - flex-nowrap: prevents items from wrapping to the next line
          - overflow-x-auto: enables horizontal scrolling
          - scrollbar-hide / no-scrollbar: hides the scrollbar for cleaner UI
          - justify-start sm:justify-center: centered on desktop, scrollable from start on mobile
      */}
      <div className="flex w-full flex-nowrap items-center justify-start overflow-x-auto gap-3 px-4 pb-4 scrollbar-hide no-scrollbar sm:justify-center sm:gap-4 scroll-smooth">
        {categories.map((category) => (
          <NavLink
            key={category}
            to={getCategoryLink(category)}
            preventScrollReset={true}
            className={({ isActive }) => `
              whitespace-nowrap rounded-full border px-6 py-2.5 sm:px-8 sm:py-3 text-sm font-bold tracking-tight transition-all duration-300 flex-shrink-0
              ${isActive 
                ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'border-slate-200 bg-white text-slate-500 hover:border-blue-600 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white'
              }
            `}
          >
            {category}
          </NavLink>
        ))}
      </div>
    </div>
  )
}

export default CategoryTabs
