import { useState, useEffect, useRef, useCallback } from 'react';
import { WheelCard, ProjectDetail } from './ProjectCard';
import './Projects.css';

const SLOT_HEIGHT = 112; // px height + spacing between items
const VISIBLE_SLOTS = [-3, -2, -1, 0, 1, 2, 3];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollPos, setScrollPos] = useState(0);

  const sectionRef = useRef(null);
  const wheelContainerRef = useRef(null);
  const scrollPosRef = useRef(0);
  const targetPosRef = useRef(0);
  const animFrameRef = useRef(null);
  const dragStartY = useRef(0);
  const dragStartPos = useRef(0);
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
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
        const list = Array.isArray(data)
          ? data.filter((item) => item && item.title && Number(item.id) !== 0)
          : [];
        setProjects(list);
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
      { threshold: 0.12 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const totalProjects = projects.length;

  // Continuous animation ticker (smooth spring / lerp damping)
  const startAnimation = useCallback(() => {
    if (animFrameRef.current) return;

    const tick = () => {
      const diff = targetPosRef.current - scrollPosRef.current;
      if (Math.abs(diff) > 0.001) {
        scrollPosRef.current += diff * 0.15;
        setScrollPos(scrollPosRef.current);
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        scrollPosRef.current = targetPosRef.current;
        setScrollPos(targetPosRef.current);
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const stepBy = useCallback(
    (delta) => {
      targetPosRef.current += delta;
      startAnimation();
    },
    [startAnimation]
  );

  const goToPrev = useCallback(() => {
    stepBy(-1);
  }, [stepBy]);

  const goToNext = useCallback(() => {
    stepBy(1);
  }, [stepBy]);

  const handleCardClick = useCallback(
    (virtualIdx) => {
      if (hasDragged.current) return;
      targetPosRef.current = virtualIdx;
      startAnimation();
    },
    [startAnimation]
  );

  // Native non-passive Wheel listener on wheel container
  useEffect(() => {
    const wheelEl = wheelContainerRef.current;
    if (!wheelEl || totalProjects === 0) return;

    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) < 10) return;
      e.preventDefault();

      const now = Date.now();
      if (now - lastWheelTime.current > 150) {
        const dir = e.deltaY > 0 ? 1 : -1;
        targetPosRef.current += dir;
        startAnimation();
        lastWheelTime.current = now;
      }
    };

    wheelEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => wheelEl.removeEventListener('wheel', handleWheel);
  }, [totalProjects, startAnimation]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isVisible) return;
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, goToPrev, goToNext]);

  // Mouse Drag handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    isDraggingRef.current = true;
    setIsDragging(true);
    hasDragged.current = false;
    dragStartY.current = e.clientY;
    dragStartPos.current = scrollPosRef.current;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const diff = e.clientY - dragStartY.current;
    if (Math.abs(diff) > 4) {
      hasDragged.current = true;
    }
    const newPos = dragStartPos.current - diff / SLOT_HEIGHT;
    scrollPosRef.current = newPos;
    targetPosRef.current = newPos;
    setScrollPos(newPos);
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    targetPosRef.current = Math.round(scrollPosRef.current);
    startAnimation();

    setTimeout(() => {
      hasDragged.current = false;
    }, 60);
  };

  // Touch handlers
  const handleTouchStart = (e) => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    isDraggingRef.current = true;
    setIsDragging(true);
    hasDragged.current = false;
    dragStartY.current = e.touches[0].clientY;
    dragStartPos.current = scrollPosRef.current;
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return;
    const diff = e.touches[0].clientY - dragStartY.current;
    if (Math.abs(diff) > 4) {
      hasDragged.current = true;
    }
    const newPos = dragStartPos.current - diff / SLOT_HEIGHT;
    scrollPosRef.current = newPos;
    targetPosRef.current = newPos;
    setScrollPos(newPos);
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    targetPosRef.current = Math.round(scrollPosRef.current);
    startAnimation();

    setTimeout(() => {
      hasDragged.current = false;
    }, 60);
  };

  // Calculate active project index for details view
  const activeIndex = totalProjects > 0
    ? ((Math.round(scrollPos) % totalProjects) + totalProjects) % totalProjects
    : 0;
  const currentProject = totalProjects > 0 ? projects[activeIndex] : null;

  // Build visible range of slots around current center
  const centerInt = Math.round(scrollPos);

  return (
    <section
      id="projects"
      className={`section projects ${isVisible ? 'projects--visible' : ''}`}
      data-bg="dark"
      ref={sectionRef}
    >
      <span className="section-label projects__label">Projects</span>

      {/* Subtle theme gradient background behind frosted glass */}
      <div className="projects__gradient-bg" aria-hidden="true">
        <div className="projects__gradient-mesh" />
        <div className="projects__bg-glow projects__bg-glow--1" />
        <div className="projects__bg-glow projects__bg-glow--2" />
        <div className="projects__bg-glow projects__bg-glow--3" />
      </div>

      {/* Frosted Glass Layer */}
      <div className="projects__frosted-glass" aria-hidden="true" />

      {/* Section Header */}
      <div className="projects__header">
        <span className="projects__tag">
          <span className="projects__tag-sparkle">✦</span> Interactive Wheel Showcase
        </span>
        <h2 className="projects__title">
          Selected <span className="projects__title-accent">Creations</span>
        </h2>
      </div>

      {/* Main Split Layout: Left 1/3 Wheel + Right 2/3 Details */}
      <div className="projects__stage-container">
        {loading ? (
          <div className="projects__loading">
            <div className="projects__spinner" />
          </div>
        ) : totalProjects === 0 ? (
          <p className="projects__empty">No projects available.</p>
        ) : (
          <div className="projects__split-layout">
            {/* ── Left 1/3rd: 3D Infinite Vertical Scroll Wheel ── */}
            <div className="projects__wheel-column">
              {/* Cylindrical 3D Wheel Stage */}
              <div
                className="projects__wheel-viewport"
                ref={wheelContainerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="projects__wheel-drum">
                  {VISIBLE_SLOTS.map((slotOffset) => {
                    const virtualIdx = centerInt + slotOffset;
                    const projIdx =
                      ((virtualIdx % totalProjects) + totalProjects) % totalProjects;
                    const proj = projects[projIdx];
                    if (!proj) return null;

                    // Physical continuous distance from center with larger wheel radius
                    const dist = virtualIdx - scrollPos;
                    const rotateX = -dist * 13; // Deg (Gentle, expansive curvature)
                    const translateY = dist * SLOT_HEIGHT; // Px
                    const translateZ = Math.max(-90, -Math.abs(dist) * 18);
                    const scale = Math.max(0.88, 1 - Math.abs(dist) * 0.045);
                    const opacity = Math.max(0.2, 1 - Math.abs(dist) * 0.22);
                    const zIndex = 30 - Math.abs(Math.round(dist));
                    const isActive = Math.abs(dist) < 0.45;

                    return (
                      <div
                        key={`vslot-${virtualIdx}`}
                        className="projects__wheel-item"
                        style={{
                          transform: `translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) scale(${scale})`,
                          opacity: opacity,
                          zIndex: zIndex,
                        }}
                      >
                        <WheelCard
                          project={proj}
                          index={projIdx}
                          offset={Math.round(dist)}
                          isActive={isActive}
                          onClick={() => handleCardClick(virtualIdx)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Right 2/3rds: Focused Project Details Showcase ── */}
            <div className="projects__details-column">
              <ProjectDetail
                project={currentProject}
                index={activeIndex}
                totalCount={totalProjects}
                onPrev={goToPrev}
                onNext={goToNext}
              />
            </div>
          </div>
        )}
      </div>

    </section>
  );
}
