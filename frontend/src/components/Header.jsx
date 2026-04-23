import { useEffect, useRef, useState } from 'react'
import { HiMagnifyingGlass, HiMoon, HiSun, HiBars3, HiXMark } from 'react-icons/hi2'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import blackLogo from '../assets/pngwale-black-logo.png'
import whiteLogo from '../assets/pngwale-white-logo.png'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about-us', label: 'About Us' },
  { to: '/contact-us', label: 'Contact Us' },
  { to: '/license', label: 'License' },
]

function Header({ theme, onToggleTheme, transparentOnTop = false }) {
  const navigate = useNavigate()
  const location = useLocation()
  const headerRef = useRef(null)
  const [searchText, setSearchText] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setSearchText(params.get('q') ?? '')
  }, [location.search])

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  const activeLogo = theme === 'dark' ? whiteLogo : blackLogo

  useEffect(() => {
    const node = headerRef.current
    if (!node) return undefined

    const updateHeaderHeight = () => {
      document.documentElement.style.setProperty('--header-height', `${node.offsetHeight}px`)
    }

    updateHeaderHeight()

    const resizeObserver = new ResizeObserver(updateHeaderHeight)
    resizeObserver.observe(node)
    window.addEventListener('resize', updateHeaderHeight)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateHeaderHeight)
    }
  }, [location.pathname])

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    const value = searchText.trim()

    if (!value) {
      navigate('/')
      return
    }

    navigate(`/?q=${encodeURIComponent(value)}`)
    setIsMenuOpen(false)
  }

  const headerClassName = `fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
    isScrolled || isMenuOpen
      ? 'bg-white/95 text-slate-900 shadow-md border-b border-slate-100 dark:bg-slate-900/95 dark:text-white dark:border-slate-800' 
      : 'bg-transparent text-slate-900 dark:text-white'
  } backdrop-blur-md`

  const getNavClassName = (isActive) => {
    return `rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 ${
      isActive
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
        : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
    }`
  }

  const mobileNavClassName = (isActive) => {
    return `flex w-full items-center rounded-xl px-4 py-3 text-base font-bold transition-all ${
      isActive
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
    }`
  }

  const searchIconClass = `pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500`

  const searchInputClass = `w-full rounded-full border py-2 pl-9 pr-20 text-sm outline-none transition-all border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-900`

  const themeBtnClass = `rounded-full border transition-all border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700`

  const searchSubmitClass = `absolute right-1 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-xs font-bold transition-all bg-blue-600 text-white hover:bg-blue-700`

  return (
    <header ref={headerRef} className={headerClassName}>
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex flex-1 justify-start">
            <Link to="/" className="shrink-0" aria-label="PNGWALE Home">
              <img src={activeLogo} alt="PNGWALE" className="h-9 w-auto md:h-10" />
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => getNavClassName(isActive)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex flex-1 items-center justify-end gap-2 md:gap-3">
            <form onSubmit={handleSearchSubmit} className="relative hidden w-full max-w-xs sm:block">
              <HiMagnifyingGlass className={searchIconClass} />
              <input
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search images..."
                className={searchInputClass}
              />
              {searchText.trim() && (
                <button type="submit" className={searchSubmitClass}>
                  Search
                </button>
              )}
            </form>

            <button
              type="button"
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              className={themeBtnClass}
            >
              {theme === 'dark' ? <HiSun className="h-5 w-5" /> : <HiMoon className="h-5 w-5" />}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <HiXMark className="h-6 w-6" /> : <HiBars3 className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="lg:hidden mt-3 space-y-4 pb-4 animate-fade-in-up">
            {/* Mobile Search - Visible only on very small screens where it's hidden in the header */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:hidden">
              <HiMagnifyingGlass className={searchIconClass} />
              <input
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search images..."
                className={searchInputClass}
              />
              {searchText.trim() && (
                <button type="submit" className={searchSubmitClass}>
                  Search
                </button>
              )}
            </form>

            <nav className="flex flex-col gap-1">
              {navLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => mobileNavClassName(isActive)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
