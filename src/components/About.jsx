import { useEffect, useRef, useState } from 'react';
import './About.css';
import NeuralNetwork from './NeuralNetwork';

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
      {/*<span className="section-label about__label">About</span>*/}

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
        {/* Left column — text content */}
        <div className="about__left">
          <div className="about__intro">
            <div className="about__badge-row">
              <span className="about__tag">Hello there 👋</span>
              {/*<div className="about__status-badge">
                <span className="about__status-dot" />
                <span>Open for Data Science & AI Opportunities</span>
              </div>*/}
            </div>
            <h2 className="about__name">
              I'm <span className="about__name-highlight">Chamila</span>
            </h2>
            <p className="about__role">Data Science & AI / ML Enthusiast</p>
          </div>

          <div className="about__divider" />

          <p className="about__bio">
            I'm a passionate technology enthusiast and Computer Science & Data Science undergraduate with a deep interest in{' '}
            <strong>
              Artificial Intelligence, Machine Learning, Data Analytics, and Intelligent Systems
            </strong>
            . I enjoy transforming raw data into actionable insights, designing robust predictive models, and building practical, AI-driven solutions. I'm actively exploring new frontiers in AI and eagerly seeking collaborative projects and career opportunities in Data Science and Machine Learning.
          </p>

          <button className="about__cta" onClick={handleContact}>
            <span className="about__cta-text">Let's Connect</span>
            <span className="about__cta-icon">
              <svg
                width="20"
                height="20"
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

        {/* Right column — Neural Network Architecture Visualization */}
        <div className="about__right">
          <NeuralNetwork />
        </div>
      </div>
    </section>
  );
}
