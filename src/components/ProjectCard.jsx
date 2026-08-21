import './ProjectCard.css';

export default function ProjectCard({
  project,
  index,
  totalCards,
  isActive,
  offset,
  onClick,
  isDragging,
}) {
  const num = String(index + 1).padStart(2, '0');
  const techStack = project.techStack || project.tags || [];
  const badge = project.badge || null;
  const category = project.category || (techStack.length > 0 ? techStack[0] : 'Project');

  const handleClick = () => {
    if (isDragging) return;
    if (onClick) {
      onClick(index);
    }
  };

  return (
    <article
      className={`scroll-card ${isActive ? 'scroll-card--active' : ''} ${
        offset < 0 ? 'scroll-card--left' : offset > 0 ? 'scroll-card--right' : ''
      }`}
      data-index={index}
      data-offset={offset}
      onClick={handleClick}
      role="group"
      aria-label={`Project ${index + 1} of ${totalCards}: ${project.title}`}
    >
      <div className="scroll-card__inner">
        {/* Top Media Frame (Golden ratio proportion) */}
        <div className="media-wrapper">
          <div
            className="full-image"
            style={{
              backgroundImage: project.image ? `url(${project.image})` : 'none',
            }}
          >
            {!project.image && (
              <div className="media-placeholder">
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

          {/* Floating Category & Index Badges */}
          <div className="card-floating-tags">
            <span className="card-badge">{badge || category}</span>
            <span className="card-number">{num}</span>
          </div>

          <div className="media-gradient-overlay" />
        </div>

        {/* Content Wrapper */}
        <div className="content-wrapper">
          <div className="text-wrapper">
            <h3 className="heading" title={project.title}>
              {project.title}
            </h3>
            <p className="description">{project.description}</p>
          </div>

          {/* Tech Stack Chips */}
          {techStack.length > 0 && (
            <div className="tech-tags">
              {techStack.map((tech) => (
                <span key={tech} className="tech-tag">
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Footer Action Button */}
          {project.githubUrl && project.githubUrl.trim() !== '' && (
            <div className="card-footer">
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="card-btn"
                tabIndex={isActive ? 0 : -1}
                onClick={(e) => e.stopPropagation()}
              >
                <svg
                  className="card-btn__github-icon"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span>View Project</span>
                <svg
                  className="card-btn__arrow-icon"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </a>
            </div>
          )}

          {/* Webflow signature Grow Background reveal animation */}
          <div className="grow-background" />
        </div>
      </div>
    </article>
  );
}
