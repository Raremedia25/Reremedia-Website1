import SectionHeader from './SectionHeader.jsx';
import './Process.css';

const steps = [
  {
    number: '01',
    title: 'Discover',
    text: 'We meet with you to understand your organization, your workflow and the problem you want solved — in your language, not technical jargon.',
  },
  {
    number: '02',
    title: 'Design',
    text: 'We map out the system: screens, features, data and security. You review and approve the design before any development begins.',
  },
  {
    number: '03',
    title: 'Develop & Test',
    text: 'We build in short cycles and show you progress along the way. Every feature is tested before it reaches you.',
  },
  {
    number: '04',
    title: 'Deliver & Support',
    text: 'We deploy the system, train your team and stay available for updates, maintenance and support long after launch.',
  },
];

export default function Process() {
  return (
    <section className="section" id="process">
      <div className="container">
        <SectionHeader
          eyebrow="How We Work"
          title="A clear process, from idea to launch"
          subtitle="You always know what's happening, what comes next and what it costs — no surprises."
        />
        <ol className="process__grid">
          {steps.map((step, index) => (
            <li
              className="process__step reveal"
              key={step.number}
              style={{ '--reveal-delay': `${index * 0.1}s` }}
            >
              <span className="process__number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
