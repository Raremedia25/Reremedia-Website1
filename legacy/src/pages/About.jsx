import { Link } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader.jsx';
import WhyChooseUs from '../components/WhyChooseUs.jsx';
import {
  TargetIcon,
  EyeIcon,
  HeartIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from '../components/icons/Icons.jsx';
import { useScrollReveal } from '../hooks/useScrollReveal.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import './About.css';
import './PageHero.css';

const values = [
  'Integrity & transparency in every project',
  'Quality that outlasts trends',
  'Client-first communication',
  'Continuous learning & innovation',
  'Security and privacy by design',
  'Long-term partnership over quick wins',
];

export default function About() {
  usePageTitle('About Us');
  useScrollReveal();

  return (
    <div className="page-enter">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">About Us</span>
          <h1>The team behind your digital transformation</h1>
          <p>
            RAREMEDIA is a technology and software development company focused on
            creating modern, reliable, secure and scalable digital solutions for
            businesses and institutions.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container about__intro">
          <div className="about__intro-text reveal">
            <span className="eyebrow">Who We Are</span>
            <h2>Technology that understands your business</h2>
            <p>
              We are a team of software engineers, designers and problem-solvers
              who build digital tools that organizations actually use — every
              day, at scale. From savings groups and SACCOs to hotels, schools
              and auditing teams, we take time to understand how you work before
              we write a single line of code.
            </p>
            <p>
              Our solutions cover the full journey: custom management systems,
              professional websites, mobile and desktop applications, secure
              databases and AI-powered tools — all backed by responsive,
              long-term support.
            </p>
            <Link to="/contact" className="btn btn--primary">
              Work With Us <ArrowRightIcon />
            </Link>
          </div>

          <div className="about__cards reveal" style={{ '--reveal-delay': '0.15s' }}>
            <div className="about__card card">
              <span className="icon-badge">
                <TargetIcon />
              </span>
              <h3>Our Mission</h3>
              <p>
                To empower businesses and institutions with smart, dependable
                software that simplifies their work, protects their data and
                accelerates their growth.
              </p>
            </div>
            <div className="about__card card">
              <span className="icon-badge">
                <EyeIcon />
              </span>
              <h3>Our Vision</h3>
              <p>
                To become a leading software development company known for
                world-class digital solutions that transform how organizations
                operate.
              </p>
            </div>
            <div className="about__card card">
              <span className="icon-badge">
                <HeartIcon />
              </span>
              <h3>Our Values</h3>
              <ul className="about__values">
                {values.map((value) => (
                  <li key={value}>
                    <CheckCircleIcon />
                    {value}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt about__why">
        <WhyChooseUs compact />
      </section>

      <section className="section about__cta-section">
        <div className="container">
          <div className="about__cta reveal">
            <h2>Let's build something great together</h2>
            <p>
              Whether you need a full management system or a simple website, we
              are ready to help you get there.
            </p>
            <Link to="/contact" className="btn btn--primary btn--lg">
              Contact Us <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
