import { Link } from 'react-router-dom';
import { ArrowRightIcon, CheckCircleIcon } from './icons/Icons.jsx';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__bg" aria-hidden="true">
        <span className="hero__orb hero__orb--1" />
        <span className="hero__orb hero__orb--2" />
        <span className="hero__grid" />
      </div>

      <div className="container hero__inner">
        <div className="hero__content">
          <span className="hero__badge">
            <span className="hero__badge-dot" />
            Software Development Company
          </span>

          <h1>
            We Build <span className="text-gradient">Smart Digital Solutions</span> for
            Your Business
          </h1>

          <p>
            RAREMEDIA designs and develops custom management systems, websites,
            mobile apps, desktop software and AI-powered solutions for businesses,
            schools, hospitals, hotels, SACCOs and organizations of every size.
          </p>

          <div className="hero__ctas">
            <Link to="/contact" className="btn btn--primary btn--lg">
              Get Started <ArrowRightIcon />
            </Link>
            <Link to="/services" className="btn btn--ghost-light btn--lg">
              View Our Services
            </Link>
            <Link to="/contact" className="hero__contact-link">
              Contact Us <ArrowRightIcon />
            </Link>
          </div>

          <ul className="hero__points">
            <li>
              <CheckCircleIcon /> Custom-built systems
            </li>
            <li>
              <CheckCircleIcon /> Secure &amp; scalable
            </li>
            <li>
              <CheckCircleIcon /> Professional support
            </li>
          </ul>
        </div>

        <div className="hero__visual" aria-hidden="true">
          <div className="hero__card hero__card--main">
            <div className="hero__card-bar">
              <span />
              <span />
              <span />
            </div>
            <div className="hero__card-body">
              <div className="hero__code-line" style={{ width: '55%' }} />
              <div className="hero__code-line hero__code-line--accent" style={{ width: '80%' }} />
              <div className="hero__code-line" style={{ width: '65%' }} />
              <div className="hero__code-line" style={{ width: '40%' }} />
              <div className="hero__code-line hero__code-line--accent" style={{ width: '70%' }} />
              <div className="hero__chart">
                <span style={{ height: '35%' }} />
                <span style={{ height: '60%' }} />
                <span style={{ height: '45%' }} />
                <span style={{ height: '80%' }} />
                <span style={{ height: '65%' }} />
                <span style={{ height: '95%' }} />
              </div>
            </div>
          </div>

          <div className="hero__card hero__card--float hero__card--stat">
            <span className="hero__stat-value">99.9%</span>
            <span className="hero__stat-label">System Uptime</span>
          </div>

          <div className="hero__card hero__card--float hero__card--check">
            <CheckCircleIcon />
            <div>
              <strong>Project Delivered</strong>
              <span>Secure • Tested • Live</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
