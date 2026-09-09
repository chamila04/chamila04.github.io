import { useEffect, useRef, useState } from 'react';
import './About.css';

export default function About({ isHeroVisible = false, isHeroExiting = false }) {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isHeroExiting || !isHeroVisible) {
      setIsVisible(true);
    }
  }, [isHeroExiting, isHeroVisible]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleContact = () => {
    const contactSection = document.querySelector('#contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
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
      {/* Dynamic multi-layer animated ambient aurora background */}
      <div className="about__gradient-bg" aria-hidden="true">
        <div className="about__ambient-aurora" />
        <div className="about__bg-glow about__bg-glow--amber about__bg-glow--1" />
        <div className="about__bg-glow about__bg-glow--emerald about__bg-glow--2" />
        <div className="about__bg-glow about__bg-glow--cyan about__bg-glow--3" />
        <div className="about__bg-glow about__bg-glow--purple about__bg-glow--4" />
        <div className="about__gradient-mesh" />
      </div>

      {/* Frosted Glass Layer */}
      <div className="about__frosted-glass" aria-hidden="true" />

      <div className="about__container">
        {/* Full-width clean minimalist editorial typography hero */}
        <div className="about__content">
          {/* Eyebrow */}
          <div className="about__eyebrow-wrap">
            <div className="about__eyebrow">
              <span className="about__status-pulse" aria-hidden="true" />
              <span className="about__eyebrow-accent" aria-hidden="true">//</span>
              <span className="about__eyebrow-text">Computer Science & Data Science</span>
            </div>
          </div>

          {/* Monumental Dual-Tone Name Headline */}
          <h1 className="about__name-headline">
            <span className="about__name-first">Chamila</span>{' '}
            <span className="about__name-last">Senaratne</span>
          </h1>

          {/* High-Contrast Editorial Statement */}
          <div className="about__pitch">
            <span className="about__pitch-serif">Driven by curiosity,</span>
            <span className="about__pitch-sans">
              fascinated by <span className="about__gradient-phrase">how machines learn</span>.
            </span>
          </div>

          {/* Refined Narrative Paragraph */}
          <p className="about__sub">
            Exploring the mathematical foundations and real-world impact of artificial intelligence.
            Focused on neural architectures, statistical modeling, and building high-performance systems that bridge deep theory with production impact.
          </p>

          {/* Action Button */}
          <div className="about__action-wrap">
            <button
              className="about__cta"
              onClick={handleContact}
              aria-label="Connect with Chamila Senaratne"
            >
              <span className="about__cta-glow" aria-hidden="true" />
              <span className="about__cta-shimmer" aria-hidden="true" />
              <span className="about__cta-inner">
                <span className="about__cta-text">Let's Connect</span>
                <span className="about__cta-badge">
                  <svg
                    className="about__cta-arrow"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
