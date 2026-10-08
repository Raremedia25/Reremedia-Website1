import SectionHeader from './SectionHeader.jsx';
import { Icon } from './icons/Icons.jsx';
import { technologyGroups } from '../data/technologies.js';
import './Technologies.css';

export default function Technologies() {
  return (
    <section className="section section--alt" id="technologies">
      <div className="container">
        <SectionHeader
          eyebrow="Technologies"
          title="The tools behind our solutions"
          subtitle="We build on modern, battle-tested technologies to deliver software that is fast, secure and easy to maintain."
        />
        <div className="tech__grid">
          {technologyGroups.map((group, index) => (
            <div
              className="tech__group card reveal"
              key={group.id}
              style={{ '--reveal-delay': `${index * 0.1}s` }}
            >
              <div className="tech__group-head">
                <span className="tech__group-icon">
                  <Icon name={group.icon} />
                </span>
                <h3>{group.label}</h3>
              </div>
              <ul className="tech__chips">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
