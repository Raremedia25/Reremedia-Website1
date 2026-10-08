import { siteInfo } from '../data/siteInfo.js';
import { useScrollReveal } from '../hooks/useScrollReveal.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import './PrivacyPolicy.css';
import './PageHero.css';

export default function PrivacyPolicy() {
  usePageTitle('Privacy Policy');
  useScrollReveal();

  return (
    <div className="page-enter">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Legal</span>
          <h1>Privacy Policy</h1>
          <p>How RAREMEDIA collects, uses and protects your information.</p>
        </div>
      </section>

      <section className="section">
        <div className="container privacy reveal">
          <p className="privacy__updated">Last updated: August 2026</p>

          <h2>1. Introduction</h2>
          <p>
            {siteInfo.name} ("we", "our", "us") respects your privacy. This
            policy explains what information we collect through this website,
            how we use it and the choices you have.
          </p>

          <h2>2. Information We Collect</h2>
          <p>
            When you use our contact form, we collect the information you
            provide: your full name, email address, phone number, company or
            organization, the service you are interested in, and your message.
            We may also collect basic technical information (such as browser
            type) needed to keep the website working correctly.
          </p>

          <h2>3. How We Use Your Information</h2>
          <ul>
            <li>To respond to your inquiries and service requests</li>
            <li>To prepare proposals and quotes you have asked for</li>
            <li>To improve our website and services</li>
            <li>To comply with legal obligations where applicable</li>
          </ul>

          <h2>4. Sharing of Information</h2>
          <p>
            We do not sell, rent or trade your personal information. Your data
            is only shared with service providers who help us operate this
            website (such as email delivery), and only to the extent necessary.
          </p>

          <h2>5. Data Security</h2>
          <p>
            We apply appropriate technical and organizational measures to
            protect your information against unauthorized access, alteration or
            loss. No method of transmission over the internet is 100% secure,
            but we work to protect your data using industry best practices.
          </p>

          <h2>6. Data Retention</h2>
          <p>
            We keep contact inquiries only as long as needed to respond to you
            and maintain our business records, after which they are deleted.
          </p>

          <h2>7. Your Rights</h2>
          <p>
            You may request access to, correction of, or deletion of the
            personal information we hold about you at any time by contacting us
            at <a href={`mailto:${siteInfo.email}`}>{siteInfo.email}</a>.
          </p>

          <h2>8. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. Any changes will be
            posted on this page with an updated revision date.
          </p>

          <h2>9. Contact</h2>
          <p>
            Questions about this policy? Reach us at{' '}
            <a href={`mailto:${siteInfo.email}`}>{siteInfo.email}</a> or{' '}
            {siteInfo.phone}, {siteInfo.location}.
          </p>
        </div>
      </section>
    </div>
  );
}
