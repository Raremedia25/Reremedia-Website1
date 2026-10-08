import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import StatsBar from '../components/StatsBar.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import WhyChooseUs from '../components/WhyChooseUs.jsx';
import Process from '../components/Process.jsx';
import { ArrowRightIcon } from '../components/icons/Icons.jsx';
import { services } from '../data/services.js';
import { projects } from '../data/projects.js';
import { useScrollReveal } from '../hooks/useScrollReveal.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import './Home.css';

export default function Home() {
  usePageTitle('');
  useScrollReveal();

  return (
    <div className="page-enter">
      <Hero />
      <StatsBar />

      {/* Services preview */}
      <section className="section" id="services-preview">
        <div className="container">
          <SectionHeader
            eyebrow="What We Do"
            title="Software solutions for every need"
            subtitle="From custom management systems to AI-powered tools — we design, build and support the software your organization depends on."
          />
          <div className="home__services-grid">
            {services.slice(0, 6).map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
          <div className="home__section-cta reveal">
            <Link to="/services" className="btn btn--outline">
              Explore All Services <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </section>

      <Process />

      <WhyChooseUs />

      {/* Portfolio preview */}
      <section className="section" id="portfolio-preview">
        <div className="container">
          <SectionHeader
            eyebrow="Our Work"
            title="Projects we're proud of"
            subtitle="Real systems built for real organizations — from finance and hospitality to education and auditing."
          />
          <div className="home__projects-grid">
            {projects.slice(0, 3).map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
          <div className="home__section-cta reveal">
            <Link to="/portfolio" className="btn btn--outline">
              View Full Portfolio <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="section home__cta-section">
        <div className="container">
          <div className="home__cta reveal">
            <div className="home__cta-content">
              <h2>Ready to build your next digital solution?</h2>
              <p>
                Tell us about your project and we'll get back to you with a clear
                plan, timeline and quote — free of charge.
              </p>
            </div>
            <div className="home__cta-actions">
              <Link to="/contact" className="btn btn--primary btn--lg">
                Get Started <ArrowRightIcon />
              </Link>
              <Link to="/about" className="btn btn--ghost-light btn--lg">
                Learn About Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
