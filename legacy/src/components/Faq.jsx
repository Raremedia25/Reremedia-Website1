import SectionHeader from './SectionHeader.jsx';
import './Faq.css';

const faqs = [
  {
    q: 'How much does a custom system or website cost?',
    a: 'It depends on the size and features of the project. After a free consultation we send you a detailed quote with a fixed price and timeline — no hidden costs.',
  },
  {
    q: 'How long does development take?',
    a: 'A professional website typically takes 1–3 weeks. Management systems usually take 4–12 weeks depending on complexity. You get a clear timeline before we start.',
  },
  {
    q: 'Do you offer support after the project is delivered?',
    a: 'Yes. Every project includes a support period, and we offer ongoing maintenance plans covering updates, backups, bug fixes and technical support.',
  },
  {
    q: 'Can you work with organizations outside Rwanda?',
    a: 'Absolutely. We work with clients remotely and deliver, deploy and support systems anywhere.',
  },
  {
    q: 'Do I own the system after it is built?',
    a: 'Yes. Once the project is completed and paid for, the system and its source code belong to you.',
  },
];

export default function Faq() {
  return (
    <section className="section section--alt" id="faq">
      <div className="container faq__container">
        <SectionHeader
          eyebrow="FAQ"
          title="Frequently asked questions"
          subtitle="Quick answers to the questions we hear most often."
        />
        <div className="faq__list">
          {faqs.map((item, index) => (
            <details
              className="faq__item reveal"
              key={item.q}
              style={{ '--reveal-delay': `${index * 0.06}s` }}
            >
              <summary>
                {item.q}
                <span className="faq__chevron" aria-hidden="true" />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
