import SectionHeader from '../components/SectionHeader.jsx';
import ContactForm from '../components/ContactForm.jsx';
import Faq from '../components/Faq.jsx';
import { siteInfo } from '../data/siteInfo.js';
import {
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  LinkedInIcon,
  XIcon,
  InstagramIcon,
  WhatsAppIcon,
} from '../components/icons/Icons.jsx';
import { useScrollReveal } from '../hooks/useScrollReveal.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import './Contact.css';
import './PageHero.css';

const socialIcons = {
  linkedin: LinkedInIcon,
  x: XIcon,
  instagram: InstagramIcon,
  whatsapp: WhatsAppIcon,
};

export default function Contact() {
  usePageTitle('Contact Us');
  useScrollReveal();

  return (
    <div className="page-enter">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Contact Us</span>
          <h1>Let's talk about your project</h1>
          <p>
            Fill in the form below and our team will get back to you with a
            clear plan and quote — usually within one business day.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container contact__layout">
          <aside className="contact__info reveal">
            <h2>Get in touch</h2>
            <p>
              Prefer to reach us directly? Use any of the channels below — we
              are happy to answer questions before you commit to anything.
            </p>

            <ul className="contact__channels">
              <li className="card">
                <span className="contact__channel-icon">
                  <MailIcon />
                </span>
                <div>
                  <strong>Email</strong>
                  <a href={`mailto:${siteInfo.email}`}>{siteInfo.email}</a>
                </div>
              </li>
              <li className="card">
                <span className="contact__channel-icon">
                  <PhoneIcon />
                </span>
                <div>
                  <strong>Phone</strong>
                  <a href={`tel:${siteInfo.phone.replace(/\s/g, '')}`}>
                    {siteInfo.phone}
                  </a>
                </div>
              </li>
              <li className="card">
                <span className="contact__channel-icon">
                  <MapPinIcon />
                </span>
                <div>
                  <strong>Location</strong>
                  <span>{siteInfo.location}</span>
                </div>
              </li>
            </ul>

            <div className="contact__socials">
              <strong>Follow us</strong>
              <ul>
                {siteInfo.socials.map((social) => {
                  const Icon = socialIcons[social.id];
                  return (
                    <li key={social.id}>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={social.label}
                      >
                        <Icon />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          <div className="contact__form-panel card reveal" style={{ '--reveal-delay': '0.12s' }}>
            <SectionHeader
              eyebrow="Request a Service"
              title="Send us a message"
              subtitle="Tell us what you need and we'll take it from there."
              align="left"
            />
            <ContactForm />
          </div>
        </div>
      </section>

      <Faq />
    </div>
  );
}
