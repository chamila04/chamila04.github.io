import { useState, useEffect, useRef } from 'react';
import './Contact.css';

export default function Contact() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const email = import.meta.env.VITE_EMAIL || 'chamilasenaratne.me@gmail.com';
  const githubUrl = import.meta.env.VITE_GITHUB_URL || 'https://github.com/chamila04';
  const linkedinUrl = import.meta.env.VITE_LINKEDIN_URL || 'https://www.linkedin.com/in/chamila-senaratne/';

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section
      id="contact"
      className={`section contact ${isVisible ? 'contact--visible' : ''}`}
      data-bg="dark"
      ref={sectionRef}
    >
      {/* ── Ambient Background Lighting & Tech Grid ── */}
      <div className="contact__bg-wrapper" aria-hidden="true">
        {/* Secondary Warm Radial Glow (Top-Left) */}
        <div className="contact__glow contact__glow--secondary" />
        {/* Accent Cyber-Lime Radial Glow (#70e000) (Bottom-Right) */}
        <div className="contact__glow contact__glow--accent" />
        {/* 40px Precision Technical Grid Overlay with Radial Vignette */}
        <div className="contact__grid-overlay" />
      </div>

      {/* ── Main Hero Editorial Content (Freeform, No Card) ── */}
      <div className="contact__container">
        {/* Monumental Dual-Tone Display Headline */}
        <h2 className="contact__headline">
          <span className="contact__headline-first">LET'S BUILD</span>
          <span className="contact__headline-second">TOGETHER.</span>
        </h2>


        {/* Direct Email Display (Open Typography) */}
        <div className="contact__email-wrapper">
          <a
            href={`mailto:${email}`}
            className="contact__email-link"
            title="Send an email to Chamila"
          >
            {email}
          </a>
        </div>

        {/* Social Logos (LinkedIn & GitHub) directly below email */}
        <div className="contact__socials">
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="contact__social-link"
            aria-label="Connect on LinkedIn"
            id="contact-linkedin-link"
          >
            <svg
              className="contact__social-icon"
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            <span className="contact__social-tooltip" role="tooltip">LINKEDIN</span>
          </a>

          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="contact__social-link"
            aria-label="Visit GitHub Profile"
            id="contact-github-link"
          >
            <svg
              className="contact__social-icon"
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span className="contact__social-tooltip" role="tooltip">GITHUB</span>
          </a>
        </div>
      </div>

      {/* ── Minimalist Compact Footer ── */}
      <footer className="contact__footer">
        <div className="contact__footer-inner">
          <div className="contact__footer-left">
            <span className="contact__footer-name">Chamila Senaratne</span>
            <span className="contact__footer-sep" aria-hidden="true">•</span>
            <span className="contact__footer-copy">© 2026</span>
          </div>

          <div className="contact__footer-right">
            <button
              type="button"
              onClick={scrollToTop}
              className="contact__footer-top-btn"
              aria-label="Back to top"
              title="Back to top"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
      </footer>
    </section>
  );
}
