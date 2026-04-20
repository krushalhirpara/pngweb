import { NavLink } from 'react-router-dom'

function CategoryTabs({ categories, activeCategory }) {
  const getCategoryLink = (category) => {
    if (category === 'All') return '/';
    return `/${category.toLowerCase().replace(/\s+/g, '-')}`;
  }

  return (
    <div className="mb-10 flex items-center justify-center">
      <div className="flex max-w-full items-center gap-2 overflow-x-auto px-4 pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 sm:gap-3">
        {categories.map((category) => (
          <NavLink
            key={category}
            to={getCategoryLink(category)}
            className={({ isActive }) => `
              whitespace-nowrap rounded-full border px-6 py-2.5 text-sm font-bold tracking-tight transition-all duration-300
              ${isActive 
                ? 'border-brand-500 bg-brand-500 text-white shadow-xl shadow-brand-500/30 -translate-y-0.5' 
                : 'border-brand-100 bg-white text-slate-500 hover:border-brand-500 hover:bg-brand-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
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
