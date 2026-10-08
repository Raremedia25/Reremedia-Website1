import { useState } from 'react';
import { services } from '../data/services.js';
import { sendContactMessage } from '../services/api.js';
import { SendIcon, CheckCircleIcon } from './icons/Icons.jsx';
import './ContactForm.css';

const initialValues = {
  fullName: '',
  email: '',
  phone: '',
  company: '',
  service: '',
  message: '',
};

function validate(values) {
  const errors = {};

  if (!values.fullName.trim()) {
    errors.fullName = 'Please enter your full name.';
  } else if (values.fullName.trim().length < 3) {
    errors.fullName = 'Name must be at least 3 characters.';
  }

  if (!values.email.trim()) {
    errors.email = 'Please enter your email address.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!values.phone.trim()) {
    errors.phone = 'Please enter your phone number.';
  } else if (!/^\+?[\d\s()-]{7,20}$/.test(values.phone.trim())) {
    errors.phone = 'Please enter a valid phone number.';
  }

  if (!values.service) {
    errors.service = 'Please select the service you need.';
  }

  if (!values.message.trim()) {
    errors.message = 'Please tell us about your project.';
  } else if (values.message.trim().length < 20) {
    errors.message = 'Message must be at least 20 characters.';
  }

  return errors;
}

export default function ContactForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setStatus('sending');
    try {
      await sendContactMessage({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        company: values.company.trim(),
        service: values.service,
        message: values.message.trim(),
      });
      setStatus('success');
      setValues(initialValues);
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="contact-form__success" role="status">
        <CheckCircleIcon />
        <h3>Message sent successfully!</h3>
        <p>
          Thank you for contacting RAREMEDIA. Our team will review your request
          and get back to you as soon as possible.
        </p>
        <button
          type="button"
          className="btn btn--outline"
          onClick={() => setStatus('idle')}
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-form__row">
        <div className="form-field">
          <label htmlFor="fullName">Full Name *</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="e.g. Jean Claude Mugisha"
            value={values.fullName}
            onChange={handleChange}
            className={errors.fullName ? 'has-error' : ''}
            autoComplete="name"
          />
          {errors.fullName && <span className="form-error">{errors.fullName}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="email">Email Address *</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@company.com"
            value={values.email}
            onChange={handleChange}
            className={errors.email ? 'has-error' : ''}
            autoComplete="email"
          />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>
      </div>

      <div className="contact-form__row">
        <div className="form-field">
          <label htmlFor="phone">Phone Number *</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+250 7xx xxx xxx"
            value={values.phone}
            onChange={handleChange}
            className={errors.phone ? 'has-error' : ''}
            autoComplete="tel"
          />
          {errors.phone && <span className="form-error">{errors.phone}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="company">Company / Organization</label>
          <input
            id="company"
            name="company"
            type="text"
            placeholder="Your company or organization"
            value={values.company}
            onChange={handleChange}
            autoComplete="organization"
          />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="service">Service Needed *</label>
        <select
          id="service"
          name="service"
          value={values.service}
          onChange={handleChange}
          className={errors.service ? 'has-error' : ''}
        >
          <option value="">Select a service…</option>
          {services.map((service) => (
            <option key={service.id} value={service.name}>
              {service.name}
            </option>
          ))}
          <option value="Other">Other</option>
        </select>
        {errors.service && <span className="form-error">{errors.service}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="message">Message *</label>
        <textarea
          id="message"
          name="message"
          rows="5"
          placeholder="Tell us about your project, your goals and any deadlines…"
          value={values.message}
          onChange={handleChange}
          className={errors.message ? 'has-error' : ''}
        />
        {errors.message && <span className="form-error">{errors.message}</span>}
      </div>

      {status === 'error' && (
        <p className="contact-form__error-banner" role="alert">
          Sorry — something went wrong while sending your message. Please try
          again, or reach us directly by email or phone.
        </p>
      )}

      <button
        type="submit"
        className="btn btn--primary btn--lg contact-form__submit"
        disabled={status === 'sending'}
      >
        {status === 'sending' ? (
          <>
            <span className="contact-form__spinner" aria-hidden="true" />
            Sending…
          </>
        ) : (
          <>
            Send Message <SendIcon />
          </>
        )}
      </button>
    </form>
  );
}
