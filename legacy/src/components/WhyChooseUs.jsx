import SectionHeader from './SectionHeader.jsx';
import { Icon } from './icons/Icons.jsx';
import './WhyChooseUs.css';

const reasons = [
  {
    icon: 'code',
    title: 'Custom Solutions',
    text: 'Every system is designed around your exact workflow — never a one-size-fits-all template.',
  },
  {
    icon: 'zap',
    title: 'Modern Technology',
    text: 'We build with current, proven technologies that keep your system fast and future-ready.',
  },
  {
    icon: 'shield',
    title: 'Secure Systems',
    text: 'Authentication, role-based access and data protection are built in from day one.',
  },
  {
    icon: 'users',
    title: 'Professional Support',
    text: 'Clear communication, training and responsive support long after delivery.',
  },
  {
    icon: 'mobile',
    title: 'Responsive Design',
    text: 'Interfaces that work beautifully on phones, tablets and desktops.',
  },
  {
    icon: 'trending',
    title: 'Scalable Software',
    text: 'Architecture that grows with you — from one branch to an entire organization.',
  },
  {
    icon: 'check',
    title: 'Fast & Reliable Performance',
    text: 'Optimized systems that stay quick and dependable, even under heavy daily use.',
  },
];

export default function WhyChooseUs({ compact = false }) {
  return (
    <section className={`section why ${compact ? '' : 'section--dark'}`} id="why-choose-us">
      <div className="container">
        <SectionHeader
          eyebrow="Why Choose Us"
          title="A partner you can rely on"
          subtitle="We combine technical expertise with a deep understanding of how real businesses and institutions work."
        />
        <div className="why__grid">
          {reasons.map((reason, index) => (
            <div
              className={`why__item reveal ${compact ? 'why__item--light' : ''}`}
              key={reason.title}
              style={{ '--reveal-delay': `${(index % 4) * 0.08}s` }}
            >
              <span className="why__icon">
                <Icon name={reason.icon} />
              </span>
              <div>
                <h3>{reason.title}</h3>
                <p>{reason.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
