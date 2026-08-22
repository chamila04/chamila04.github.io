import { useState, useEffect, useRef, useCallback } from 'react';
import ProjectCard from './ProjectCard';
import './Projects.css';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [cardMetrics, setCardMetrics] = useState({ width: 360, gap: 28 });

  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const dragStartX = useRef(0);
  const hasDragged = useRef(false);
  const lastWheelTime = useRef(0);

  // Fetch projects data
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}projects.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const filtered = (Array.isArray(data) ? data : []).filter(
          (item) => Number(item.id) !== 0
        );
        setProjects(filtered);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load projects:', err);
        setLoading(false);
      });
  }, []);

  // Section reveal observer
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

  // Measure actual card width & gap dynamically on resize
  const measureCardMetrics = useCallback(() => {
    if (!trackRef.current) return;
    const firstCard = trackRef.current.querySelector('.scroll-card');
    if (firstCard) {
      const rect = firstCard.getBoundingClientRect();
      const style = window.getComputedStyle(trackRef.current);
      const gap = parseFloat(style.gap) || 28;
      setCardMetrics({
        width: rect.width || 360,
        gap: gap,
      });
    }
  }, []);

  useEffect(() => {
    measureCardMetrics();
    window.addEventListener('resize', measureCardMetrics);
    return () => window.removeEventListener('resize', measureCardMetrics);
  }, [measureCardMetrics, projects, loading]);

  const goToIndex = useCallback((index) => {
    if (index >= 0 && index < projects.length) {
      setActiveIndex(index);
    }
  }, [projects.length]);

  const goToPrev = useCallback(() => {
    setActiveIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => Math.min(projects.length - 1, prev + 1));
  }, [projects.length]);

  // Native non-passive Wheel listener to smoothly step horizontally 1 card at a time
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || projects.length === 0) return;

    const handleNativeWheel = (e) => {
      const now = Date.now();
      if (Math.abs(e.deltaY) < 14 && Math.abs(e.deltaX) < 14) return;

      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

      if (delta > 14) {
        // Scrolling down / right -> advance 1 card
        if (activeIndex < projects.length - 1) {
          e.preventDefault();
          if (now - lastWheelTime.current > 240) {
            goToNext();
            lastWheelTime.current = now;
          }
        }
        // On last card, allow normal vertical page scroll down to Contact
      } else if (delta < -14) {
        // Scrolling up / left -> previous 1 card
        if (activeIndex > 0) {
          e.preventDefault();
          if (now - lastWheelTime.current > 240) {
            goToPrev();
            lastWheelTime.current = now;
          }
        }
        // On first card, allow normal vertical page scroll up to Journey
      }
    };

    el.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleNativeWheel);
  }, [activeIndex, projects.length, goToNext, goToPrev]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isVisible) return;
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, goToPrev, goToNext]);

  // Mouse Drag handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    hasDragged.current = false;
    dragStartX.current = e.clientX;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const diff = e.clientX - dragStartX.current;
    if (Math.abs(diff) > 6) {
      hasDragged.current = true;
    }
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 50;
    if (dragOffset < -threshold && activeIndex < projects.length - 1) {
      goToNext();
    } else if (dragOffset > threshold && activeIndex > 0) {
      goToPrev();
    }

    setDragOffset(0);
    setTimeout(() => {
      hasDragged.current = false;
    }, 50);
  };

  // Touch handlers
  const handleTouchStart = (e) => {
    setIsDragging(true);
    hasDragged.current = false;
    dragStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - dragStartX.current;
    if (Math.abs(diff) > 6) {
      hasDragged.current = true;
    }
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 45;
    if (dragOffset < -threshold && activeIndex < projects.length - 1) {
      goToNext();
    } else if (dragOffset > threshold && activeIndex > 0) {
      goToPrev();
    }

    setDragOffset(0);
    setTimeout(() => {
      hasDragged.current = false;
    }, 50);
  };

  // Centering translation so the active card is always centered in the viewport
  const trackTranslateX = -(activeIndex * (cardMetrics.width + cardMetrics.gap)) + dragOffset;

  return (
    <section
      id="projects"
      className={`section projects ${isVisible ? 'projects--visible' : ''}`}
      data-bg="dark"
      ref={sectionRef}
    >
      <span className="section-label projects__label">Projects</span>

      {/* Ambient Glows */}
      <div className="projects__bg-glow projects__bg-glow--cyan" />
      <div className="projects__bg-glow projects__bg-glow--indigo" />
      <div className="projects__bg-grid" />

      {/* Section Header */}
      <div className="projects__header">
        <span className="projects__tag">
          <span className="projects__tag-sparkle">✦</span> Featured Showcase
        </span>
        <h2 className="projects__title">
          Selected <span className="projects__title-accent">Creations</span>
        </h2>
      </div>

      {/* Webflow Style Horizontal Cards Row */}
      <div className="projects__stage-container">
        {loading ? (
          <div className="projects__loading">
            <div className="projects__spinner" />
          </div>
        ) : projects.length === 0 ? (
          <p className="projects__empty">No projects available.</p>
        ) : (
          <div
            className="sticky-wrap"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className={`scroll-inner ${isDragging ? 'scroll-inner--dragging' : ''}`}
              ref={trackRef}
              style={{
                transform: `translate3d(${trackTranslateX}px, 0, 0)`,
                paddingLeft: `calc(50vw - ${cardMetrics.width / 2}px)`,
                paddingRight: `calc(50vw - ${cardMetrics.width / 2}px)`,
              }}
            >
              {projects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  totalCards={projects.length}
                  isActive={index === activeIndex}
                  offset={index - activeIndex}
                  onClick={goToIndex}
                  isDragging={hasDragged.current}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      {!loading && projects.length > 0 && (
        <div className="projects__controls">
          <div className="projects__pagination">
            {projects.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                className={`projects__dot ${idx === activeIndex ? 'projects__dot--active' : ''}`}
                onClick={() => goToIndex(idx)}
                aria-label={`Go to project ${idx + 1}`}
              />
            ))}
          </div>

          <div className="projects__counter">
            <span className="projects__counter-current">
              {String(activeIndex + 1).padStart(2, '0')}
            </span>
            <span className="projects__counter-sep">/</span>
            <span className="projects__counter-total">
              {String(projects.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

