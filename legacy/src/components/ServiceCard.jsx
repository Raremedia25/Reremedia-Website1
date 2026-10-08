import { Link } from 'react-router-dom';
import { Icon, ArrowRightIcon } from './icons/Icons.jsx';
import './ServiceCard.css';

export default function ServiceCard({ service, index = 0 }) {
  return (
    <article
      className="service-card card reveal"
      style={{ '--reveal-delay': `${(index % 3) * 0.1}s` }}
    >
      <span className="icon-badge">
        <Icon name={service.icon} />
      </span>
      <h3>{service.name}</h3>
      <p>{service.short}</p>
      <Link to={`/services#${service.id}`} className="service-card__link">
        Learn More <ArrowRightIcon />
      </Link>
    </article>
  );
}
