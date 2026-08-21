import { useState, useEffect, useRef } from 'react';
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

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

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section
      id="contact"
      className={`section contact ${isVisible ? 'contact--visible' : ''}`}
      data-bg="slate"
      ref={sectionRef}
    >
      <span className="section-label contact__label">Contact</span>

      {/* Floating background orbs */}
      <div className="contact__orb contact__orb--1" />
      <div className="contact__orb contact__orb--2" />
      <div className="contact__orb contact__orb--3" />

      <div className="contact__grid">
        {/* Left column — CTA + Socials */}
        <div className="contact__left">
          <div className="contact__intro">
            <span className="contact__tag">Get in Touch</span>
            <h2 className="contact__title">
              Let's create
              <br />
              something{' '}
              <span className="contact__title-accent">amazing</span>
            </h2>
            <p className="contact__subtitle">
              Have a project in mind, a question, or just want to say hello?
              I'd love to hear from you. Let's build something great together.
            </p>
          </div>

          <div className="contact__social-grid">
            <a
              href={import.meta.env.VITE_GITHUB_URL || 'https://github.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="contact__social-card"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <div>
                <span className="contact__social-name">GitHub</span>
                <span className="contact__social-handle">{import.meta.env.VITE_GITHUB_USERNAME || '@chamila'}</span>
              </div>
            </a>

            <a
              href={import.meta.env.VITE_LINKEDIN_URL || 'https://linkedin.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="contact__social-card"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              <div>
                <span className="contact__social-name">LinkedIn</span>
                <span className="contact__social-handle">{import.meta.env.VITE_LINKEDIN_USERNAME || 'Chamila'}</span>
              </div>
            </a>

            <a
              href={`mailto:${import.meta.env.VITE_EMAIL || 'hello@example.com'}`}
              className="contact__social-card"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <div>
                <span className="contact__social-name">Email</span>
                <span className="contact__social-handle">{import.meta.env.VITE_EMAIL || 'hello@example.com'}</span>
              </div>
            </a>
          </div>
        </div>

        {/* Right column — Form */}
        <div className="contact__right">
          <form className="contact__form" onSubmit={handleSubmit}>
            <div className="contact__field">
              <label className="contact__field-label" htmlFor="contact-name">
                Name
              </label>
              <input
                type="text"
                name="name"
                id="contact-name"
                placeholder="What's your name?"
                value={formData.name}
                onChange={handleChange}
                required
                className="contact__input"
              />
            </div>
            <div className="contact__field">
              <label className="contact__field-label" htmlFor="contact-email">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="contact-email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="contact__input"
              />
            </div>
            <div className="contact__field">
              <label className="contact__field-label" htmlFor="contact-message">
                Message
              </label>
              <textarea
                name="message"
                id="contact-message"
                placeholder="Tell me about your project..."
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
                className="contact__input contact__textarea"
              />
            </div>
            <button
              type="submit"
              className="contact__submit"
              disabled={submitted}
            >
              {submitted ? (
                <span className="contact__success">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Message Sent!
                </span>
              ) : (
                <>
                  <span>Send Message</span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="contact__footer">
        <div className="contact__footer-inner">
          <div className="contact__footer-brand">
            <span className="contact__footer-name">Chamila</span>
            <span className="contact__footer-tagline">
              Developer & Tech Enthusiast
            </span>
          </div>
          <div className="contact__footer-links">
            <a href="#about" className="contact__footer-link">About</a>
            <a href="#journey" className="contact__footer-link">Journey</a>
            <a href="#projects" className="contact__footer-link">Projects</a>
            <a href="#contact" className="contact__footer-link">Contact</a>
          </div>
          <div className="contact__footer-copy">
            <p>© 2026 Chamila. Crafted with passion & curiosity.</p>
          </div>
        </div>
      </footer>
    </section>
  );
}
