# INNOVEXA STUDIOS — Project State

## Current phase
**Post-Phase 4 polish — backend email wiring confirmed working + accessibility/SEO pass complete.**

## Stack
React 18 (Vite) + Tailwind CSS + Framer Motion + lucide-react on the frontend.
Express + MongoDB (Mongoose) + Nodemailer on the backend.

## Latest changes (most recent pass — accessibility & SEO)
Scope was deliberately narrow since visual design, animation, backend, and content had
all already had dedicated passes:

- **SEO**: added Open Graph + Twitter Card meta tags and `theme-color` to `index.html`
  (React) and the static preview. `og:image`/`og:url` use placeholder/relative values —
  **must be updated to absolute URLs on the real domain once deployed**, or social
  previews on Facebook/LinkedIn/X won't resolve the image.
- **Keyboard accessibility**: added a global `:focus-visible` ring (`#3B82F6`, 2px) since
  the dark theme made the browser's default outline nearly invisible; added a
  "Skip to content" link, visually hidden until keyboard-focused.
- **Color contrast**: audited every `text-white/NN` opacity level against the `#0B0D17`
  background using the WCAG relative-luminance formula. Fixed three real failures —
  footer copyright/legal text and case-study/service numbering were under the 4.5:1
  AA threshold for normal text, bumped from `/25–/35` to `/40–/45`. Left the small
  low-contrast text inside the illustrative UI mockups (Hero dashboard, code editor,
  browser-chrome address bar) alone — WCAG 1.4.3 exempts decorative/incidental text
  that's part of an illustration rather than primary content.
- **Reduced motion**: found and fixed one gap — the Cybersecurity service mockup's
  infinite scan-line animation used Framer Motion's JS-driven `animate`, which isn't
  covered by the global CSS `prefers-reduced-motion` override (that only catches CSS
  `@keyframes`/`transition`, not Framer's rAF-driven animations). Now wrapped in
  `useReducedMotion()`.
- Heading hierarchy audited and already correct (single `h1` in Hero, `h2` per section,
  `h3` for sub-items) — no changes needed there.

## Service background art
The six "What we build" panels use original illustrations (not photographs, not stock) —
`frontend/public/images/services/{web,software,mobile,ai,cloud,security}.jpg`. Editable
vector sources + generator live in `design-assets/service-art/`. Swap any file (or change
the path in `SERVICE_PHOTOS` in `ServicesPreview.jsx`) to use your own photography.
Aurora Wave and the faint SVG patterns were tried and rejected; soft mesh sits under the art.
Internships "Apply Now" still points at `PLACEHOLDER_GOOGLE_FORM_URL` — needs the real form link.

## Brand asset status
Phase 2 was briefed as shipping with a **vector SVG logo**, but what was actually
uploaded was a **PNG raster image** (AI-generated, not a design-tool export). Since no
SVG existed, the mark was **not redrawn** — it was cropped directly from the supplied
PNG and chroma-keyed to transparent PNG:

- `frontend/public/logo-icon.png` — icon mark only (navbar, footer, hero mockup, favicon)
- `frontend/public/logo-full.png` — icon + wordmark lockup (og:image, larger placements)
- `frontend/public/favicon.png` — 64×64 icon crop

**Known limitation:** raster crops, not vectors — won't scale losslessly, can't be
recolored for a light-background variant, and have a faint edge halo from the chroma-key
cutout up close. Send a real `.svg` if one becomes available and these three files get
regenerated from it — no component changes needed, everything references them by path.

## Nav anchor mapping
Work → `#work` · Services → `#services` · Solutions → `#solutions` · Process → `#process`
· Internships → `#internships` · About → `#about` (Founder section) · Contact → `#connect`

The Phase 2 brief didn't give distinct content for "Solutions" and "Process" as nav items,
so they were mapped to the closest existing sections (Build/Scale/Automate, and the
client-principles section respectively) — flag if dedicated sections were actually wanted.

## Backend / contact form
- `POST /api/contact` validates all four fields are present and non-blank (whitespace-only
  now correctly rejected, not just missing), saves to MongoDB, emails a notification to
  `innovexastudios2026@gmail.com` with a clickable `mailto:` reply link, and returns
  `{ success, message }` consistently across all routes (contact, 404, 500, rate-limit).
- CORS accepts a comma-separated `CLIENT_URL` list, defaulting to both `localhost:5173`
  and `localhost:3000` for local dev.
- User has confirmed local setup is in progress (Gmail App Password + MongoDB connection)
  as of the last exchange — no code changes needed on this front unless something breaks.

## Sections on the homepage (in order)
Navbar · Hero (cinematic UI composition) · First-scroll statement (Build/Scale/Automate)
· Featured Work (3 concept case studies) · Services preview (6 tracks, per-service mockup)
· Trust/positioning (4 principles, no fabricated stats) · Internships · Founder
· Final CTA · Contact form · Footer

## Known gaps / not yet done
- `og:image`/`og:url` need real absolute URLs post-deployment
- No automated accessibility testing (axe, Lighthouse CI) run — this was a manual audit
  only; ARIA live regions for the form's success/error banner and real screen-reader
  testing weren't covered
- Internship section content is intentionally light (no stipend/duration/eligibility)
  since none were provided
- Founder section uses a placeholder initials avatar (no real photo supplied)
- Featured Work / Services mockups are original illustrative UI, not real product
  screenshots — fine for concept stage, swap in real work once it exists
- Full responsive QA done via Tailwind breakpoints + a mobile-simplified hero, not
  tested on physical devices

## Next phase
Not yet scoped. Candidates: live MongoDB/email end-to-end test on the user's machine,
real internship program details, real founder photo, deployment to Vercel/Render/Atlas
per DEPLOYMENT.md, or another visual polish pass.


## Production-readiness pass (latest)
- Frontend: no localhost fallback in production; endpoint resolved in `src/lib/api.js` from `VITE_API_URL`.
- Backend: required-env checks, `trust proxy`, CORS from `CLIENT_URL`, graceful shutdown, `/api/health`,
  input validation + HTML escaping in emails, email sent in background with `emailStatus` on each lead,
  optional Resend HTTPS transport (Render free blocks SMTP ports).
- Docs: README.md and DEPLOYMENT.md rewritten for GitHub + Render + Atlas.
