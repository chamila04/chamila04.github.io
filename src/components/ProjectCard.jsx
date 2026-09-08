import { useState, useEffect, useMemo } from 'react';
import './ProjectCard.css';

/**
 * Resolves asset URL handling base paths and external URLs
 */
const resolveAssetUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const cleanPath = url.startsWith('/') ? url.slice(1) : url;
  return `${import.meta.env.BASE_URL}${cleanPath}`;
};

/**
 * ProjectCard: Editorial card inspired by Awwwards layout
 * - Framed inset image thumbnail with hover zoom
 * - Bold title
 * - Accent-colored category (Cyan / Teal)
 * - Muted publication / development date
 * - Concise description & tech pills
 * - Interactive repository / project view links
 */
export function ProjectCard({ project, index = 0 }) {
  const images = useMemo(() => {
    if (!project) return [];
    const rawImages =
      Array.isArray(project.images) && project.images.length > 0
        ? project.images
        : project.image
        ? [project.image]
        : [];
    return rawImages.map(resolveAssetUrl).filter(Boolean);
  }, [project]);

  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-cycle through preview images when user hovers over card
  useEffect(() => {
    if (images.length <= 1 || !isHovered) return;

    const timer = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }, 2200);

    return () => clearInterval(timer);
  }, [images.length, isHovered]);

  if (!project) return null;

  const badge = project.badge || null;
  const category = project.category || 'Project';
  const techStack = project.techStack || project.tags || [];

  const handleDotClick = (e, idx) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImgIndex(idx);
  };

  return (
    <article
      className="awwwards-card"
      data-index={index}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImgIndex(0);
      }}
    >
      {/* ── Inset Media Frame (Framed by card padding) ── */}
      <div className="awwwards-card__media-frame">
        {badge && (
          <span className="awwwards-card__badge" aria-label={`Badge: ${badge}`}>
            {badge}
          </span>
        )}

        {/* Multi-image indicator badge */}
        {images.length > 1 && (
          <div className="awwwards-card__counter">
            <span>
              {currentImgIndex + 1}/{images.length}
            </span>
          </div>
        )}

        {/* Image Container */}
        <div className="awwwards-card__image-container">
          {images.length > 0 ? (
            images.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`${project.title} preview ${i + 1}`}
                className={`awwwards-card__img ${
                  i === currentImgIndex ? 'awwwards-card__img--active' : ''
                }`}
                loading="lazy"
              />
            ))
          ) : (
            <div className="awwwards-card__placeholder">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="2" y="2" width="20" height="20" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}
        </div>

        {/* Slide navigation dots if multiple images */}
        {images.length > 1 && (
          <div className="awwwards-card__dots" role="tablist" aria-label="Image gallery dots">
            {images.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                className={`awwwards-card__dot ${
                  dotIdx === currentImgIndex ? 'awwwards-card__dot--active' : ''
                }`}
                onClick={(e) => handleDotClick(e, dotIdx)}
                aria-label={`Show image ${dotIdx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Content Area: Title -> Category -> Date (Awwwards order) ── */}
      <div className="awwwards-card__body">
        <h3 className="awwwards-card__title" title={project.title}>
          {project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="awwwards-card__title-link"
            >
              {project.title}
            </a>
          ) : (
            project.title
          )}
        </h3>

        {/* Category (Teal/Cyan Accent) */}
        <div className="awwwards-card__category">{category}</div>

        {/* Brief Description */}
        {project.description && (
          <p className="awwwards-card__description">{project.description}</p>
        )}

        {/* Tech Stack Chips */}
        {techStack.length > 0 && (
          <div className="awwwards-card__tech-list">
            {techStack.slice(0, 4).map((tech) => (
              <span key={tech} className="awwwards-card__tech-chip">
                {tech}
              </span>
            ))}
            {techStack.length > 4 && (
              <span className="awwwards-card__tech-chip awwwards-card__tech-chip--more">
                +{techStack.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer Action */}
        <div className="awwwards-card__footer">
          {project.githubUrl && project.githubUrl.trim() !== '' ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="awwwards-card__btn"
              aria-label={`View code for ${project.title}`}
            >
              <svg
                className="awwwards-card__github-icon"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span>View Source</span>
              <svg
                className="awwwards-card__arrow-icon"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </a>
          ) : (
            <div className="awwwards-card__btn awwwards-card__btn--disabled">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Repository Private</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProjectCard;
