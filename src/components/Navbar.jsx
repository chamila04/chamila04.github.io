import { useState, useEffect } from 'react';
import './Navbar.css';

const navItems = [
  {
    label: 'About',
    href: '#about',
    id: 'about',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: 'Journey',
    href: '#journey',
    id: 'journey',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    label: 'Projects',
    href: '#projects',
    id: 'projects',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    label: 'Contact',
    href: '#contact',
    id: 'contact',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    ),
  },
];

export default function Navbar({ heroVisible = false }) {
  const [activeSection, setActiveSection] = useState('about');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sectionIds = ['contact', 'projects', 'journey', 'about'];
      let found = '';

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.45 && rect.bottom > 120) {
            found = id;
            break;
          }
        }
      }

      if (found) {
        setActiveSection(found);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = (e, href) => {
    e.preventDefault();
    setIsMobileOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(href.slice(1));
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const isHidden = heroVisible || activeSection === 'hero';

  const currentItem = navItems.find((item) => item.id === activeSection) || navItems[0];

  return (
    <>
      {/* Mobile Backdrop when menu is open */}
      {isMobileOpen && (
        <div
          className="navbar__mobile-backdrop"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`navbar-wrapper navbar--${activeSection} ${
          isHidden ? 'navbar-wrapper--hidden' : ''
        } ${isMobileOpen ? 'navbar-wrapper--mobile-open' : ''}`}
        aria-label="Page navigation"
      >
        {/* Mobile Toggle Button (Visible only on <= 768px) */}
        <button
          type="button"
          className="navbar__mobile-toggle"
          onClick={toggleMobileMenu}
          aria-label={isMobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileOpen}
        >
          <span className="navbar__mobile-toggle-curr">
            <span className="navbar__mobile-toggle-icon">{currentItem.icon}</span>
            <span className="navbar__mobile-toggle-label">{currentItem.label}</span>
          </span>
          <span className={`navbar__mobile-burger ${isMobileOpen ? 'navbar__mobile-burger--open' : ''}`}>
            <span className="navbar__mobile-burger-line" />
            <span className="navbar__mobile-burger-line" />
          </span>
        </button>

        {/* Dock: Horizontal on Desktop, Collapsible Vertical on Mobile */}
        <nav className={`navbar__dock ${isMobileOpen ? 'navbar__dock--mobile-open' : ''}`}>
          <ul className="navbar__list">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.label} className="navbar__item">
                  <a
                    href={item.href}
                    className={`navbar__link ${isActive ? 'navbar__link--active' : ''}`}
                    onClick={(e) => handleClick(e, item.href)}
                    aria-label={item.label}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    <span className="navbar__link-icon" aria-hidden="true">{item.icon}</span>
                    <span className="navbar__link-text">{item.label}</span>
                    {isActive && <span className="navbar__active-indicator" />}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}


