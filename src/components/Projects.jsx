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

  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const dragStartX = useRef(0);
  const hasDragged = useRef(false);
  const lastWheelTime = useRef(0);

  useEffect(() => {
    fetch('/projects.json')
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        if (data.length > 1) {
          // Default to the 2nd item for an immediate balanced fanning deck
          setActiveIndex(Math.min(1, data.length - 1));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load projects:', err);
        setLoading(false);
      });
  }, []);

  // IntersectionObserver for reveal animation
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

  // Keyboard navigation when user uses arrow keys
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

  // Horizontal wheel / trackpad support
  const handleWheel = (e) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 280) return;

    if (Math.abs(e.deltaX) > 20) {
      if (e.deltaX > 20) {
        goToNext();
        lastWheelTime.current = now;
      } else if (e.deltaX < -20) {
        goToPrev();
        lastWheelTime.current = now;
      }
    }
  };

  // Mouse Drag handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Primary button only
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
    // Clamped drag elasticity
    const clampedDiff = Math.max(-140, Math.min(140, diff));
    setDragOffset(clampedDiff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragOffset < -35 && activeIndex < projects.length - 1) {
      goToNext();
    } else if (dragOffset > 35 && activeIndex > 0) {
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
    const clampedDiff = Math.max(-140, Math.min(140, diff));
    setDragOffset(clampedDiff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragOffset < -35 && activeIndex < projects.length - 1) {
      goToNext();
    } else if (dragOffset > 35 && activeIndex > 0) {
      goToPrev();
    }

    setDragOffset(0);
    setTimeout(() => {
      hasDragged.current = false;
    }, 50);
  };

  return (
    <section
      id="projects"
      className={`section projects ${isVisible ? 'projects--visible' : ''}`}
      data-bg="dark"
      ref={sectionRef}
    >
      <span className="section-label projects__label">Projects</span>

      {/* Decorative ambient neon spotlights */}
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

      {/* 3D Deck / Stack Stage */}
      <div
        className="projects__stage-wrapper"
        onWheel={handleWheel}
      >
        {loading ? (
          <div className="projects__loading">
            <div className="projects__spinner" />
          </div>
        ) : projects.length === 0 ? (
          <p className="projects__empty">No projects available.</p>
        ) : (
          <div
            className={`projects__stage ${isDragging ? 'projects__stage--dragging' : ''}`}
            ref={stageRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              '--drag-x': `${dragOffset}px`,
            }}
          >
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                activeIndex={activeIndex}
                totalCards={projects.length}
                onClick={goToIndex}
                isDragging={hasDragged.current}
              />
            ))}

            {/* Navigation Arrows with Neon Glass Styling */}
            <button
              type="button"
              className={`projects__nav-btn projects__nav-btn--prev ${
                activeIndex === 0 ? 'projects__nav-btn--disabled' : ''
              }`}
              onClick={goToPrev}
              disabled={activeIndex === 0}
              aria-label="Previous project"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <button
              type="button"
              className={`projects__nav-btn projects__nav-btn--next ${
                activeIndex === projects.length - 1 ? 'projects__nav-btn--disabled' : ''
              }`}
              onClick={goToNext}
              disabled={activeIndex === projects.length - 1}
              aria-label="Next project"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Pagination & Navigation Controls */}
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

