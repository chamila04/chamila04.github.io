import { useEffect, useRef, useState } from 'react';
import './About.css';
import LossLandscape from './LossLandscape';

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
      {/* Dynamic 4-section animated blur gradient background */}
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
        {/* Left column — high-contrast, multi-font, gradient typography hero */}
        <div className="about__left">
          <div className="about__eyebrow">
            <span className="about__eyebrow-accent" aria-hidden="true">//</span>
            <span className="about__eyebrow-text">Computer Science & Data Science</span>
          </div>

          <h1 className="about__name-headline">
            <span className="about__name-first">Chamila</span>{' '}
            <span className="about__name-last">Senaratne</span>
          </h1>

          <div className="about__pitch">
            <span className="about__pitch-serif">Driven by curiosity,</span>
            <span className="about__pitch-sans">
              fascinated by <span className="about__gradient-phrase">how machines learn</span>.
            </span>
          </div>

          <p className="about__sub">
            Exploring the mathematical foundations and real-world impact of artificial intelligence.
          </p>

          <div className="about__action-wrap">
            <button className="about__cta" onClick={handleContact}>
              <span className="about__cta-text">Let's Connect</span>
              <span className="about__cta-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="13 6 19 12 13 18" />
                </svg>
              </span>
            </button>
          </div>
        </div>

        {/* Right column — 3D Mathematical Loss Landscape & Gradient Descent */}
        <div className="about__right">
          <LossLandscape />
        </div>
      </div>
    </section>
  );
}
