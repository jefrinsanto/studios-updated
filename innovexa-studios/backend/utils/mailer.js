const nodemailer = require("nodemailer");

/**
 * Email delivery for new-lead notifications.
 *
 * Transport order:
 *   1. Resend HTTPS API   — used when RESEND_API_KEY is set (works on every host)
 *   2. SMTP (Gmail, etc.) — used when SMTP_USER + SMTP_PASS are set
 *
 * NOTE: Render's FREE web services block outbound SMTP ports 25/465/587, so
 * Gmail SMTP only works there on a paid instance. On the free plan, set
 * RESEND_API_KEY instead (HTTPS, port 443). Leads are always saved to MongoDB
 * first, so nothing is lost if email delivery fails.
 */

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT) || 465;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM =
  process.env.RESEND_FROM || "INNOVEXA STUDIOS <onboarding@resend.dev>";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // 465 = implicit SSL, 587 = STARTTLS
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    // Fail fast instead of hanging if the port is blocked / host unreachable
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
  return transporter;
}

function getTransportName() {
  if (RESEND_API_KEY) return "resend";
  if (SMTP_USER && SMTP_PASS) return "smtp";
  return null;
}

function logEmailConfig() {
  const t = getTransportName();
  if (t === "resend") {
    console.log("📧 Email transport: Resend (HTTPS API)");
  } else if (t === "smtp") {
    console.log(`📧 Email transport: SMTP (${SMTP_HOST}:${SMTP_PORT})`);
    if (process.env.RENDER) {
      console.warn(
        "⚠️  Running on Render with SMTP. Free Render web services block SMTP " +
          "ports (25/465/587) — emails will time out unless this is a paid " +
          "instance. Set RESEND_API_KEY to send over HTTPS instead."
      );
    }
  } else {
    console.warn(
      "⚠️  No email transport configured (set SMTP_USER + SMTP_PASS, or " +
        "RESEND_API_KEY). Leads will still be saved to MongoDB."
    );
  }
}

async function sendViaResend({ to, replyTo, subject, text, html }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: [to],
      reply_to: replyTo,
      subject,
      text,
      html,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend API ${res.status}: ${body.slice(0, 200)}`);
  }
}

async function sendMail({ to, replyTo, subject, text, html }) {
  const t = getTransportName();
  if (t === "resend") return sendViaResend({ to, replyTo, subject, text, html });
  if (t === "smtp") {
    return getTransporter().sendMail({
      from: `"INNOVEXA STUDIOS Website" <${SMTP_USER}>`,
      to,
      replyTo,
      subject,
      text,
      html,
    });
  }
  throw new Error("No email transport configured");
}

module.exports = { sendMail, logEmailConfig };
