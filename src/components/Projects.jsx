import { useState, useEffect, useRef } from 'react';
import ProjectCard from './ProjectCard';
import './Projects.css';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

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
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="projects"
      className={`section projects ${isVisible ? 'projects--visible' : ''}`}
      data-bg="dark"
      ref={sectionRef}
    >
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
          <span className="projects__tag-sparkle">✦</span> Featured Projects
        </span>
        <h2 className="projects__title">
          Selected <span className="projects__title-accent">Projects</span>
        </h2>
      </div>

      {/* Projects Grid Container */}
      <div className="projects__container">
        {loading ? (
          <div className="projects__loading">
            <div className="projects__spinner" />
          </div>
        ) : projects.length === 0 ? (
          <p className="projects__empty">No projects available.</p>
        ) : (
          <div className="projects__grid">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id || index}
                project={project}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
