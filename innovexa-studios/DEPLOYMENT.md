# INNOVEXA STUDIOS — Production Deployment (GitHub + Render + MongoDB Atlas)

Stack: **React + Vite** static site (Render Static Site) · **Node/Express** API (Render Web Service) · **MongoDB Atlas** · **Gmail SMTP** (or Resend, see the warning in step 4).

Deploy in this order: **Atlas → GitHub → Backend → Frontend → connect them (CORS)**.

---

## 1. MongoDB Atlas

1. Sign up at https://www.mongodb.com/atlas → create a free **M0** cluster.
2. **Database Access** → *Add New Database User* → username + a long random password (letters/numbers only avoids URL-encoding problems) → role **Read and write to any database**.
3. **Network Access** → *Add IP Address* → **Allow access from anywhere (`0.0.0.0/0`)**. Render's outbound IPs aren't fixed, so protection comes from your strong DB password.
4. **Database → Connect → Drivers** → copy the string and insert the database name before `?`:
   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/innovexa-studios?retryWrites=true&w=majority
   ```
   This is your `MONGO_URI`. If the password has special characters (`@ : / ? # %`), URL-encode them.
5. Leads are stored in the `contacts` collection (Atlas → Browse Collections).

## 2. Email — Gmail SMTP

1. Use a Gmail account (e.g. `innovexastudios2026@gmail.com`) and turn on **2-Step Verification**: https://myaccount.google.com/security
2. Create an **App Password**: https://myaccount.google.com/apppasswords → name it "Innovexa website" → copy the 16-character code **without spaces**.
3. Values:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=innovexastudios2026@gmail.com
   SMTP_PASS=<16-char app password>
   NOTIFY_EMAIL=innovexastudios2026@gmail.com
   ```

> ⚠️ **Render free plan blocks SMTP.** Free Render web services block outbound traffic on ports 25, 465 and 587 (Render changelog, Sept 2025), so Gmail SMTP will time out on the free plan even with correct credentials. Your options:
> - **Free:** use Resend (HTTPS API, not blocked). Create an account at https://resend.com **with the same email as `NOTIFY_EMAIL`**, create an API key, and set `RESEND_API_KEY` in Render. The backend uses it automatically instead of SMTP.
> - **Paid:** upgrade the Render web service to any paid instance, and Gmail SMTP works as configured.
>
> Either way, **every lead is saved to MongoDB first**, so nothing is lost if email fails (failed ones are marked `emailStatus: "failed"` in Atlas).

## 3. GitHub

From the project root (`innovexa-studios/`):
```bash
git init
git add .
git commit -m "Initial deployment"
git branch -M main
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```
Before pushing, run `git status` and confirm no `.env` file and no `node_modules` appear. The root `.gitignore` excludes them; only `.env.example` files are committed.

## 4. Backend — Render Web Service

Render → **New → Web Service** → connect your GitHub repo.

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

**Environment variables** (Environment tab):

| Key | Value |
|---|---|
| `MONGO_URI` | your Atlas string (step 1) |
| `CLIENT_URL` | your frontend URL, e.g. `https://innovexa-studios.onrender.com` — **no trailing slash**. Add a second origin after a comma if needed. |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | your Gmail address |
| `SMTP_PASS` | Gmail App Password (no spaces) |
| `NOTIFY_EMAIL` | address that receives leads |
| `RESEND_API_KEY` | *(free plan only — see warning above)* |
| `NODE_ENV` | `production` |

Do **not** set `PORT` — Render provides it.

After deploy, open `https://YOUR-BACKEND.onrender.com/api/health` — you should see `{"status":"ok", ... "database":"connected"}`. Note the backend URL for the next step. (You can deploy the backend first with a placeholder `CLIENT_URL`, then update it once the frontend exists.)

## 5. Frontend — Render Static Site

Render → **New → Static Site** → same repo.

| Setting | Value |
|---|---|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

**Environment variable:**

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://YOUR-BACKEND.onrender.com` (no trailing slash) |

`VITE_API_URL` is baked in at **build time** — after changing it, trigger *Manual Deploy → Clear build cache & deploy*.

## 6. Connect them (CORS)

1. Copy the frontend URL Render gives you (e.g. `https://innovexa-studios.onrender.com`).
2. Backend service → Environment → set `CLIENT_URL` to exactly that origin (scheme + host, no path, no trailing slash) → save (Render redeploys).
3. If you add a custom domain later, add it too: `CLIENT_URL=https://innovexa-studios.onrender.com,https://www.yourdomain.com`

## 7. Test

1. Visit the frontend and submit the contact form.
2. Expect the green success message. Check Atlas → `contacts` for the new lead, then your inbox.
3. Browser DevTools → Network: the request must go to `https://YOUR-BACKEND.onrender.com/api/contact` (never `localhost`).

---

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| "Unable to reach the server" + CORS error in console | `CLIENT_URL` doesn't exactly match the frontend origin (check `https`, no trailing `/`). |
| Form says "not configured yet" | `VITE_API_URL` missing at build time → set it and redeploy with cache cleared. |
| First submission is slow (30–60 s) | Free backend was asleep; it wakes on the first request. The form waits up to 60 s. |
| Backend crashes: `MongoDB initial connection failed` | Wrong password/URI, special characters not URL-encoded, or Atlas Network Access missing `0.0.0.0/0`. |
| Lead saved but no email; log shows timeout | Free Render blocks SMTP → set `RESEND_API_KEY` or use a paid instance. |
| Log: `Invalid login` / `535` | Using the normal Gmail password instead of an **App Password**, or 2-Step Verification is off. |
| Resend `403` / only some recipients work | Without a verified domain Resend only delivers to your own signup email. |
| 429 "Too many submissions" | Rate limit: 10 submissions / 15 min per IP. |

## Final checklist

- [ ] `.env` files are NOT in Git (`git status` clean of `.env`, `node_modules`)
- [ ] Atlas: user created, `0.0.0.0/0` allowed, `MONGO_URI` includes `/innovexa-studios`
- [ ] Gmail: 2-Step on, App Password created (or `RESEND_API_KEY` set for free Render)
- [ ] Backend Render env vars all set; Root Directory `backend`; Start `npm start`
- [ ] `/api/health` returns `ok` and `database: connected`
- [ ] Frontend Render: Root `frontend`, Build `npm install && npm run build`, Publish `dist`
- [ ] `VITE_API_URL` = backend URL (https, no trailing slash); frontend redeployed after setting it
- [ ] `CLIENT_URL` = frontend URL exactly (https, no trailing slash)
- [ ] Test submission → saved in Atlas → email received
- [ ] No `localhost` requests in browser Network tab
