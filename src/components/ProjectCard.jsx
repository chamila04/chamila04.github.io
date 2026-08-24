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
 * WheelCard: Compact, wide card rendered inside the 3D vertical scroll wheel on the left
 */
export function WheelCard({ project, index, offset, isActive, onClick }) {
  const num = String(index + 1).padStart(2, '0');

  return (
    <div
      className={`wheel-card ${isActive ? 'wheel-card--active' : ''} wheel-card--offset-${offset}`}
      data-offset={offset}
      data-index={index}
      onClick={() => onClick(offset)}
      role="button"
      tabIndex={0}
      aria-label={`Select project ${index + 1}: ${project.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(offset);
        }
      }}
    >
      <div className="wheel-card__indicator" />
      <div className="wheel-card__index">{num}</div>
      <div className="wheel-card__body">
        <h3 className="wheel-card__title" title={project.title}>
          {project.title}
        </h3>
      </div>
      {isActive && (
        <div className="wheel-card__active-badge">
          <span>Active</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      )}
    </div>
  );
}

/**
 * ProjectDetail: Rich details showcase rendered on the right 2/3rds for the focused card
 */
export function ProjectDetail({ project, index, totalCount, onPrev, onNext }) {
  if (!project) return null;

  const num = String(index + 1).padStart(2, '0');
  const total = String(totalCount).padStart(2, '0');
  const techStack = project.techStack || project.tags || [];
  const badge = project.badge || project.category || 'Featured';
  const projectImage = resolveAssetUrl(project.image);

  return (
    <article className="project-detail" key={project.id || index}>
      <div className="project-detail__card">
        {/* Top Meta Bar */}
        <div className="project-detail__top-bar">
          <div className="project-detail__tags">
            <span className="project-detail__badge">
              <span className="project-detail__badge-sparkle">✦</span>
              {badge}
            </span>
            {project.category && project.category !== badge && (
              <span className="project-detail__category">{project.category}</span>
            )}
          </div>

          {/* Quick Step Controls & Counter */}
          <div className="project-detail__nav">
            <button
              type="button"
              className="project-detail__nav-btn"
              onClick={onPrev}
              aria-label="Previous project"
              title="Previous project (Up)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
            <div className="project-detail__counter">
              <span className="project-detail__counter-curr">{num}</span>
              <span className="project-detail__counter-sep">/</span>
              <span className="project-detail__counter-total">{total}</span>
            </div>
            <button
              type="button"
              className="project-detail__nav-btn"
              onClick={onNext}
              aria-label="Next project"
              title="Next project (Down)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>

        {/* Title & Tech Stack in Same Row */}
        <div className="project-detail__header-row">
          <h3 className="project-detail__title">{project.title}</h3>
          {techStack.length > 0 && (
            <div className="project-detail__tech-tags">
              {techStack.map((tech) => (
                <span key={tech} className="project-detail__tech-tag">
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Media Frame */}
        <div className="project-detail__media-wrapper">
          <div
            className="project-detail__image"
            style={{
              backgroundImage: projectImage ? `url("${projectImage}")` : 'none',
            }}
          >
            {!projectImage && (
              <div className="project-detail__media-placeholder">
                <svg
                  width="48"
                  height="48"
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
          <div className="project-detail__media-overlay" />
          <div className="project-detail__media-shine" />
        </div>

        {/* Content Body: Description */}
        <div className="project-detail__content">
          <p className="project-detail__description">{project.description}</p>
        </div>

        {/* Footer Actions */}
        <div className="project-detail__footer">
          {project.githubUrl && project.githubUrl.trim() !== '' ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="project-detail__action-btn"
            >
              <svg
                className="project-detail__github-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span>View Source & Project</span>
              <svg
                className="project-detail__arrow-icon"
                width="14"
                height="14"
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
            <div className="project-detail__action-btn project-detail__action-btn--disabled">
              <svg
                className="project-detail__github-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span>Repository Private</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default WheelCard;
