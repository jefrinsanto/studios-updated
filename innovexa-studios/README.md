# INNOVEXA STUDIOS — Website

React (Vite + Tailwind + Framer Motion) frontend · Express + MongoDB (Mongoose) + Nodemailer backend.

```
innovexa-studios/
├── .gitignore
├── README.md
├── DEPLOYMENT.md              # full production guide (GitHub + Render + Atlas)
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   ├── index.html
│   └── src/ (components/, lib/api.js, App.jsx, main.jsx, index.css)
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── .env.example
│   ├── routes/contact.js
│   ├── models/Contact.js
│   └── utils/mailer.js
└── preview/index.html         # static visual preview (not used in production)
```

## Run locally

**Backend**
```bash
cd backend
npm install
cp .env.example .env     # then fill in MONGO_URI, SMTP_USER, SMTP_PASS
npm run dev              # http://localhost:5000  (health: /api/health)
```
**Frontend**
```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```
In development the frontend calls `/api/contact`, which Vite proxies to `localhost:5000` — leave `VITE_API_URL` empty.

## Production build / start

```bash
cd frontend && npm install && npm run build     # outputs frontend/dist
cd backend  && npm install && npm start
```

## Environment variables

**Backend** (`backend/.env`, or Render → Environment): `MONGO_URI`, `CLIENT_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `NOTIFY_EMAIL`, `PORT` (Render sets this), optional `RESEND_API_KEY`.
**Frontend** (`frontend/.env`, or Render → Environment): `VITE_API_URL` (backend base URL, production only).

Real `.env` files are git-ignored; commit only the `.env.example` files.

## Deploy

See **[DEPLOYMENT.md](DEPLOYMENT.md)** — step-by-step for MongoDB Atlas, Gmail SMTP, GitHub and Render, with troubleshooting and a final checklist.

> Render's free web services block SMTP ports, so Gmail SMTP needs a paid instance there; on the free plan use `RESEND_API_KEY`. Details in DEPLOYMENT.md.
