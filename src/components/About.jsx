import { useEffect, useRef, useState } from 'react';
import './About.css';

const interests = [
  { label: 'Artificial Intelligence', icon: '🤖' },
  { label: 'Machine Learning', icon: '🧠' },
  { label: 'Data Science', icon: '📊' },
  { label: 'Deep Learning', icon: '🔬' },
  { label: 'Generative AI', icon: '⚡' },
  { label: 'NLP & LLMs', icon: '💬' },
  { label: 'Computer Vision', icon: '👁️' },
  { label: 'Predictive AI', icon: '📈' },
  { label: 'Neural Networks', icon: '🕸️' },
  { label: 'Data Analytics', icon: '📉' },
  { label: 'MLOps & Pipelines', icon: '⚙️' },
  { label: 'Reinforcement Learning', icon: '🎯' },
  { label: 'Python & PyTorch', icon: '🐍' },
  { label: 'Autonomous Agents', icon: '🦾' },
];

export default function About({ isHeroExiting = false }) {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isHeroExiting) {
      setIsVisible(true);
    }
  }, [isHeroExiting]);

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

  return (
    <section
      id="about"
      className={`section about ${isVisible ? 'about--visible' : ''}`}
      data-bg="dark"
      ref={sectionRef}
    >
      {/*<span className="section-label about__label">About</span>*/}

      {/* Subtle theme gradient background behind frosted glass */}
      <div className="about__gradient-bg" aria-hidden="true">
        <div className="about__gradient-mesh" />
        <div className="about__bg-glow about__bg-glow--1" />
        <div className="about__bg-glow about__bg-glow--2" />
        <div className="about__bg-glow about__bg-glow--3" />
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
            . I enjoy transforming raw data into actionable insights, designing robust predictive models, and building practical, AI-driven solutions. I'm actively exploring new frontiers in AI and eagerly seeking collaborative projects, internships, and career opportunities in Data Science and Machine Learning.
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
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </span>
          </button>
        </div>

        {/* Right column — floating interest tags */}
        <div className="about__right">
          <div className="about__interests">
            {interests.map((item, i) => (
              <div
                className="about__interest-chip"
                key={item.label}
                style={{
                  animationDelay: `${0.12 + (i % 6) * 0.06}s`,
                  '--float-delay': `${(i * 0.35) % 3}s`,
                  '--float-duration': `${3.2 + (i % 4) * 0.6}s`,
                }}
              >
                <span className="about__interest-icon">{item.icon}</span>
                <span className="about__interest-label">{item.label}</span>
              </div>
            ))}
          </div>
          <p className="about__right-caption">Areas of Interest</p>
        </div>
      </div>
    </section>
  );
}
