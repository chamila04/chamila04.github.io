import { useState, useEffect, useRef } from 'react';
import ProjectCard from './ProjectCard';
import './Projects.css';
import projectsData from '../../public/projects.json';

export default function Projects() {
  const [projects, setProjects] = useState(() => {
    return Array.isArray(projectsData)
      ? projectsData
          .filter((item) => item && item.title && Number(item.id) !== 0)
          .sort((a, b) => Number(b.id) - Number(a.id))
      : [];
  });
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Sync if projectsData changes
  useEffect(() => {
    if (Array.isArray(projectsData)) {
      setProjects(
        projectsData
          .filter((item) => item && item.title && Number(item.id) !== 0)
          .sort((a, b) => Number(b.id) - Number(a.id))
      );
    }
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

      {/* Section Header matching Persona creative layout */}
      <div className="projects__header">
        <h2 className="projects__header-title">
          02 / SELECTED WORKS
        </h2>
        <div className="projects__header-line" aria-hidden="true" />
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
