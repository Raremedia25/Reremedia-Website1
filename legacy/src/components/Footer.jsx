import { Link } from 'react-router-dom';
import { services } from '../data/services.js';
import { siteInfo } from '../data/siteInfo.js';
import {
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  LinkedInIcon,
  XIcon,
  InstagramIcon,
  WhatsAppIcon,
} from './icons/Icons.jsx';
import './Footer.css';

const socialIcons = {
  linkedin: LinkedInIcon,
  x: XIcon,
  instagram: InstagramIcon,
  whatsapp: WhatsAppIcon,
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Link to="/" className="footer__logo-row">
            <span className="footer__logo">R</span>
            <span className="footer__name">
              RARE<span className="footer__name-accent">MEDIA</span>
            </span>
          </Link>
          <p>
            A software development company building modern, reliable, secure and
            scalable digital solutions — from management systems and websites to
            mobile apps, desktop software and AI-powered tools.
          </p>
          <ul className="footer__socials">
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

        <nav className="footer__col" aria-label="Quick links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/portfolio">Portfolio</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
          </ul>
        </nav>

        <nav className="footer__col" aria-label="Services">
          <h4>Our Services</h4>
          <ul>
            {services.map((service) => (
              <li key={service.id}>
                <Link to={`/services#${service.id}`}>{service.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__col">
          <h4>Contact</h4>
          <ul className="footer__contact">
            <li>
              <MailIcon />
              <a href={`mailto:${siteInfo.email}`}>{siteInfo.email}</a>
            </li>
            <li>
              <PhoneIcon />
              <a href={`tel:${siteInfo.phone.replace(/\s/g, '')}`}>{siteInfo.phone}</a>
            </li>
            <li>
              <MapPinIcon />
              <span>{siteInfo.location}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© {year} {siteInfo.name}. All rights reserved.</p>
          <p>
            <Link to="/privacy-policy">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
