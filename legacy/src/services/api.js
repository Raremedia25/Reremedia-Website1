/**
 * Contact API client.
 *
 * Set VITE_CONTACT_API_URL in a .env file to point the form at a real
 * backend endpoint (e.g. a Spring Boot controller that sends emails).
 * While it is unset, the form simulates a successful send so the site
 * is fully usable before the backend exists.
 *
 * Expected backend contract:
 *   POST {VITE_CONTACT_API_URL}
 *   Content-Type: application/json
 *   Body: { fullName, email, phone, company, service, message }
 *   Success: any 2xx response
 */
const API_URL = import.meta.env.VITE_CONTACT_API_URL;

export async function sendContactMessage(payload) {
  if (!API_URL) {
    // No backend configured yet — simulate a successful send.
    await new Promise((resolve) => setTimeout(resolve, 900));
    return { ok: true, simulated: true };
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return { ok: true, simulated: false };
}
