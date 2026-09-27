import { useEffect, useRef, useState } from 'react';
import './About.css';

export default function About({ isHeroVisible = false, isHeroExiting = false }) {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [timeString, setTimeString] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);

  // Synchronize visibility with Hero exit or initial load
  useEffect(() => {
    if (isHeroExiting || !isHeroVisible) {
      setIsVisible(true);
    }
  }, [isHeroExiting, isHeroVisible]);

  // Intersection observer for entrance animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Live clock formatter (HH:mm)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTimeString(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic scroll percentage tracker
  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const scrolled = Math.min(100, Math.max(0, Math.round((window.scrollY / docHeight) * 100)));
        setScrollProgress(scrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleContact = () => {
    const contactSection = document.querySelector('#contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollNext = () => {
    const nextSection = document.querySelector('#journey') || document.querySelector('#projects');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const coverStateClass = isHeroVisible
    ? isHeroExiting
      ? 'about--revealing'
      : 'about--covered'
    : 'about--revealed';

  return (
    <section
      id="about"
      className={`section about ${isVisible ? 'about--visible' : ''} ${coverStateClass}`}
      data-bg="dark"
      ref={sectionRef}
    >
      {/* ── Ambient Background Lighting & Tech Grid ── */}
      <div className="about__bg-wrapper" aria-hidden="true">
        {/* Secondary Warm Radial Glow (Top-Left) */}
        <div className="about__glow about__glow--secondary" />
        {/* Accent Cyber-Lime Radial Glow (Bottom-Right) */}
        <div className="about__glow about__glow--accent" />
        {/* 40px Precision Technical Grid Overlay with Radial Vignette */}
        <div className="about__grid-overlay" />
      </div>

      {/* ── Main Hero Editorial Content (Centered) ── */}
      <div className="about__container">
        {/* Top Status Pill */}
        <div className="about__status-wrap">
          <div className="about__status-pill">
            <span className="about__status-dot" aria-hidden="true" />
            <span className="about__status-text">ONLINE • SRI LANKA</span>
          </div>
        </div>

        {/* Monumental Dual-Tone Display Headline */}
        <h1 className="about__headline">
          <span className="about__headline-first">CHAMILA</span>
          <span className="about__headline-second">SENARATNE</span>
        </h1>

        {/* Split Role & Editorial Statement Row */}
        <div className="about__meta-row">
          <p className="about__role-tag">
            <span className="about__role-prefix">//</span> DATA SCIENCE · AI · ML
          </p>

          <span className="about__meta-divider" aria-hidden="true" />

          <p className="about__bio-statement">
            Building data-driven solutions and machine learning
            <br />
            architectures for real-world impact.
          </p>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        type="button"
        className="about__scroll-indicator"
        onClick={handleScrollNext}
        aria-label="Scroll to exploration sections"
      >
        <span className="about__scroll-text">SCROLL</span>
        <div className="about__scroll-stem">
          <span className="about__scroll-light" />
        </div>
      </button>

      {/* System HUD Floating Control Dock */}
      <nav
        className="about__hud-dock"
        role="navigation"
        aria-label="Quick System HUD Controls"
      >
        {/* Telemetry / Sys Online */}
        <div className="about__hud-module about__hud-module--status">
          <svg
            className="about__hud-icon about__hud-icon--pulse"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
          </svg>
          <span className="about__hud-label">SYS.ONLINE</span>
        </div>

        {/* Time & Scroll Telemetry */}
        <div className="about__hud-module about__hud-module--telemetry">
          <svg
            className="about__hud-icon about__hud-icon--clock"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="about__hud-time">{timeString || '00:00'}</span>
          <span className="about__hud-pipe" aria-hidden="true">|</span>
          <span className="about__hud-percent">{scrollProgress}%</span>
        </div>

        {/* Quick Action Button Group */}
        <div className="about__hud-actions">
          {/* Contact Trigger */}
          <button
            type="button"
            className="about__hud-btn group"
            onClick={handleContact}
            aria-label="Jump to Contact Section"
          >
            <svg
              className="about__hud-btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
              <rect x="2" y="4" width="20" height="16" rx="2" />
            </svg>
            <span className="about__hud-tooltip" role="tooltip">CONTACT</span>
          </button>

          {/* GitHub Link */}
          <a
            href="https://github.com/chamila04"
            target="_blank"
            rel="noopener noreferrer"
            className="about__hud-btn group"
            aria-label="Visit Chamila's GitHub Profile"
          >
            <svg
              className="about__hud-btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            <span className="about__hud-tooltip" role="tooltip">GITHUB</span>
          </a>
        </div>
      </nav>
    </section>
  );
}
