import { Link } from 'react-router-dom';
import { Icon, ArrowRightIcon } from './icons/Icons.jsx';
import './ProjectCard.css';

export default function ProjectCard({ project, index = 0 }) {
  const [from, to] = project.accent;

  return (
    <article
      className="project-card card reveal"
      style={{ '--reveal-delay': `${(index % 3) * 0.1}s` }}
    >
      <div
        className="project-card__visual"
        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
        aria-hidden={project.image ? undefined : 'true'}
      >
        {project.image && (
          <img
            className="project-card__image"
            src={project.image}
            alt={`${project.name} preview`}
            loading="lazy"
          />
        )}
        <div className="project-card__window">
          <div className="project-card__window-bar">
            <span />
            <span />
            <span />
          </div>
          <div className="project-card__window-body">
            <Icon name={project.icon} />
            <div className="project-card__lines">
              <span style={{ width: '85%' }} />
              <span style={{ width: '60%' }} />
              <span style={{ width: '72%' }} />
            </div>
          </div>
        </div>
        <span className="project-card__category">{project.category}</span>
      </div>

      <div className="project-card__body">
        <h3>{project.name}</h3>
        <p>{project.short}</p>
        <Link to={`/portfolio#${project.id}`} className="project-card__link">
          View Project <ArrowRightIcon />
        </Link>
      </div>
    </article>
  );
}
