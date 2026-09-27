import './ProjectCard.css';

/**
 * ProjectCard: Cyber-tactical editorial card inspired by the Persona creative layout
 * - Minimalist dark container with subtle border
 * - Top-right GitHub icon linking directly to repository
 * - Monumental Fraunces serif title with subtle hover translation
 * - Fluid narrative description
 * - Monospace pill tech stack tags
 * - Bottom action links (View Source / Visit Site)
 * - Atmospheric bottom-right radial glow on hover (cyber lime / tactical flame)
 */
export function ProjectCard({ project, index = 0 }) {
  if (!project) return null;

  const techStack = project.techStack || project.tags || [];
  const isOdd = index % 2 === 1;
  const glowVariant = isOdd ? 'secondary' : 'accent';

  // Target GitHub repository URL
  const githubRepoUrl = project.githubUrl && project.githubUrl.trim() !== ''
    ? project.githubUrl
    : 'https://github.com/chamila04';

  // External live / demo site URL if present
  const liveSiteUrl = project.liveUrl || project.demoUrl || project.siteUrl || null;

  return (
    <article
      className={`persona-card persona-card--${glowVariant}`}
      data-index={index}
    >
      {/* ── Top-Right GitHub Repository Corner Link ── */}
      <a
        href={githubRepoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="persona-card__github-corner"
        aria-label={`View ${project.title} on GitHub`}
      >
        <svg
          className="persona-card__github-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
          <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
      </a>

      {/* ── Main Editorial Content ── */}
      <div className="persona-card__content">
        {/* Fraunces Headline Title */}
        <h3 className="persona-card__title">
          {project.title}
        </h3>

        {/* Narrative Description */}
        {project.description && (
          <p className="persona-card__description">
            {project.description}
          </p>
        )}

        {/* Monospace Tech Stack Badges */}
        {techStack.length > 0 && (
          <div className="persona-card__tags">
            {techStack.map((tech) => (
              <span key={tech} className="persona-card__tag">
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom Action Links ── */}
      <div className="persona-card__actions">
        {/* If live demo/site URL exists, show Visit Site */}
        {liveSiteUrl ? (
          <a
            href={liveSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="persona-card__action-link persona-card__action-link--site"
          >
            <svg
              className="persona-card__action-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 3h6v6" />
              <path d="M10 14 21 3" />
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            </svg>
            <span>Visit Site</span>
          </a>
        ) : null}

        {/* View Source Link */}
        <a
          href={githubRepoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="persona-card__action-link persona-card__action-link--source"
        >
          <svg
            className="persona-card__action-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
          <span>View Source</span>
        </a>
      </div>

      {/* ── Hover Atmospheric Radial Glow (Bottom-Right) ── */}
      <div
        className={`persona-card__ambient-glow persona-card__ambient-glow--${glowVariant}`}
        aria-hidden="true"
      />
    </article>
  );
}

export default ProjectCard;
