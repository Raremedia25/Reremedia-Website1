import { Link } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader.jsx';
import { Icon, CheckIcon, ArrowRightIcon } from '../components/icons/Icons.jsx';
import { services } from '../data/services.js';
import { useScrollReveal } from '../hooks/useScrollReveal.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import './Services.css';
import './PageHero.css';

export default function Services() {
  usePageTitle('Our Services');
  useScrollReveal();

  return (
    <div className="page-enter">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Our Services</span>
          <h1>Everything your organization needs to go digital</h1>
          <p>
            Seven service areas, one goal: software that makes your work easier,
            faster and more secure.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="What We Offer"
            title="Explore our full range of services"
            subtitle="Every engagement starts with understanding your needs — then we design, build, deliver and support."
          />

          <div className="services__list">
            {services.map((service, index) => (
              <article
                className="services__item card reveal"
                key={service.id}
                id={service.id}
                style={{ '--reveal-delay': `${(index % 2) * 0.1}s` }}
              >
                <div className="services__item-head">
                  <span className="icon-badge">
                    <Icon name={service.icon} />
                  </span>
                  <div>
                    <h3>{service.name}</h3>
                    <p>{service.short}</p>
                  </div>
                </div>
                <ul className="services__item-list">
                  {service.items.map((item) => (
                    <li key={item}>
                      <CheckIcon />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/contact" className="services__item-cta">
                  Request This Service <ArrowRightIcon />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt services__cta-section">
        <div className="container services__cta reveal">
          <h2>Not sure which service you need?</h2>
          <p>
            Tell us your challenge and we'll recommend the right solution — no
            technical knowledge required.
          </p>
          <Link to="/contact" className="btn btn--primary btn--lg">
            Talk To Our Team <ArrowRightIcon />
          </Link>
        </div>
      </section>
    </div>
  );
}
