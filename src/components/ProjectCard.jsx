import './ProjectCard.css';

export default function ProjectCard({
  project,
  index,
  activeIndex,
  totalCards,
  onClick,
  isDragging,
}) {
  const offset = index - activeIndex;
  const isActive = offset === 0;
  const isVisible = Math.abs(offset) <= 2;
  const num = String(index + 1).padStart(2, '0');

  const techStack = project.techStack || project.tags || [];
  const badge = project.badge || null;
  const category = project.category || (techStack.length > 0 ? techStack[0] : 'Project');

  const handleClick = (e) => {
    if (isDragging) return;
    if (!isActive && onClick) {
      e.preventDefault();
      onClick(index);
    }
  };

  return (
    <div
      className={`pcard ${isActive ? 'pcard--active' : ''} ${
        !isVisible ? 'pcard--hidden' : ''
      }`}
      data-offset={offset}
      style={{
        '--offset': offset,
        '--abs-offset': Math.abs(offset),
      }}
      onClick={handleClick}
      role="group"
      aria-label={`Project ${index + 1} of ${totalCards}: ${project.title}`}
      aria-hidden={!isVisible}
    >
      <div className="pcard__inner">
        {/* Top Image Media Frame */}
        <div className="pcard__image-wrap">
          <div
            className="pcard__image"
            style={{
              backgroundImage: project.image ? `url(${project.image})` : 'none',
            }}
          >
            {!project.image && (
              <div className="pcard__placeholder">
                <svg
                  width="32"
                  height="32"
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

          {/* Floating Minimal Badges */}
          <div className="pcard__header-tags">
            <span className="pcard__category-tag">
              {badge || category}
            </span>
            <span className="pcard__index-num">{num}</span>
          </div>
        </div>

        {/* Bottom Details Content */}
        <div className="pcard__body">
          <h3 className="pcard__title" title={project.title}>
            {project.title}
          </h3>

          <p className="pcard__description">{project.description}</p>

          {/* Tech Stack Chips */}
          {techStack.length > 0 && (
            <div className="pcard__tech-list">
              {techStack.map((tech) => (
                <span key={tech} className="pcard__tech-item">
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Footer Action */}
          {project.githubUrl && project.githubUrl.trim() !== '' && (
            <div className="pcard__footer">
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pcard__link-btn"
                tabIndex={isActive ? 0 : -1}
                onClick={(e) => e.stopPropagation()}
              >
                <span>View Project</span>
                <svg
                  width="14"
                  height="14"
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
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



