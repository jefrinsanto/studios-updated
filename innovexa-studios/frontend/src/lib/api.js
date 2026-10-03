// Resolves the contact-form endpoint.
//
// VITE_API_URL = your deployed backend's base URL, e.g.
//   https://innovexa-studios-api.onrender.com
// (a full ".../api/contact" URL is also accepted).
//
// - Production: VITE_API_URL is required. There is intentionally NO localhost
//   fallback, so a production build can never silently point at localhost.
// - Development: if VITE_API_URL is empty, "/api/contact" is used and Vite's
//   dev-server proxy (vite.config.js) forwards it to http://localhost:5000.
//
// NOTE: VITE_* values are baked in at BUILD time — redeploy the frontend
// after changing VITE_API_URL.

function resolveContactUrl() {
  const raw = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");

  if (raw) {
    if (/\/api\/contact$/.test(raw)) return raw;
    return `${raw.replace(/\/api$/, "")}/api/contact`;
  }

  if (import.meta.env.DEV) return "/api/contact";

  console.error(
    "VITE_API_URL is not set. Set it in your hosting dashboard and rebuild the frontend."
  );
  return null;
}

export const CONTACT_API_URL = resolveContactUrl();
