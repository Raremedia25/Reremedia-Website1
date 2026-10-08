import { useState } from 'react';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { ArrowRightIcon } from '../components/icons/Icons.jsx';
import { projects, projectCategories } from '../data/projects.js';
import { useScrollReveal } from '../hooks/useScrollReveal.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import './Portfolio.css';
import './PageHero.css';

export default function Portfolio() {
  usePageTitle('Our Projects');
  const [activeCategory, setActiveCategory] = useState('All');
  useScrollReveal([activeCategory]);

  const filtered =
    activeCategory === 'All'
      ? projects
      : projects.filter((project) => project.category === activeCategory);

  return (
    <div className="page-enter">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Our Projects</span>
          <h1>Solutions we've built for real organizations</h1>
          <p>
            A selection of the management systems, platforms and applications
            developed by the RAREMEDIA team.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="Portfolio"
            title="Browse our work"
            subtitle="Filter by category to see the kind of solution you're looking for."
          />

          <div className="portfolio__filters reveal" role="tablist" aria-label="Project categories">
            {projectCategories.map((category) => (
              <button
                type="button"
                key={category}
                role="tab"
                aria-selected={activeCategory === category}
                className={`portfolio__filter ${
                  activeCategory === category ? 'is-active' : ''
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="portfolio__grid" key={activeCategory}>
            {filtered.map((project, index) => (
              <div id={project.id} className="portfolio__anchor" key={project.id}>
                <ProjectCard project={project} index={index} />
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="portfolio__empty">No projects in this category yet.</p>
          )}
        </div>
      </section>

      <section className="section section--alt portfolio__cta-section">
        <div className="container portfolio__cta reveal">
          <h2>Want a system like one of these?</h2>
          <p>
            We can build a custom version tailored to your organization — or
            something completely new.
          </p>
          <Link to="/contact" className="btn btn--primary btn--lg">
            Request a Project <ArrowRightIcon />
          </Link>
        </div>
      </section>
    </div>
  );
}
