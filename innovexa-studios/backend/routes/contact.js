const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Contact = require("../models/Contact");
const { sendMail } = require("../utils/mailer");

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const PHONE_RE = /^[0-9+()\-.\s]{6,20}$/;

/** Escape user input before placing it in the HTML email (prevents HTML injection). */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Strip CR/LF so user input can never inject extra email headers. */
function singleLine(value) {
  return String(value).replace(/[\r\n]+/g, " ").trim();
}

/**
 * Validates the request body. Returns an error message string, or null if valid.
 */
function validate(body) {
  const required = ["name", "email", "phone", "message"];
  const missing = required.filter(
    (f) => typeof body[f] !== "string" || body[f].trim().length === 0
  );
  if (missing.length > 0) {
    return `Missing or empty field(s): ${missing.join(", ")}`;
  }
  if (body.name.trim().length > 100) return "Name is too long (max 100 characters).";
  if (body.email.trim().length > 254 || !EMAIL_RE.test(body.email.trim())) {
    return "Please enter a valid email address.";
  }
  if (!PHONE_RE.test(body.phone.trim())) {
    return "Please enter a valid contact number.";
  }
  if (body.message.trim().length > 2000) {
    return "Message is too long (max 2000 characters).";
  }
  return null;
}

function buildNotificationEmail({ name, email, phone, message, submittedAt }) {
  const n = escapeHtml(name);
  const e = escapeHtml(email);
  const p = escapeHtml(phone);
  const m = escapeHtml(message);
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <div style="background: linear-gradient(135deg, #3B82F6, #A855F7); padding: 20px 24px; border-radius: 10px 10px 0 0;">
        <h2 style="margin: 0; color: #ffffff; font-size: 18px;">New Lead — INNOVEXA STUDIOS</h2>
      </div>
      <div style="border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; padding: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; width: 120px;">Name</td>
            <td style="padding: 8px 0; font-weight: 600;">${n}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Email</td>
            <td style="padding: 8px 0;"><a href="mailto:${e}" style="color: #3B82F6; text-decoration: none;">${e}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Phone</td>
            <td style="padding: 8px 0;">${p}</td>
          </tr>
        </table>
        <p style="margin: 20px 0 6px; color: #6b7280; font-size: 14px;">Message</p>
        <p style="white-space: pre-wrap; background: #f3f4f6; padding: 14px; border-radius: 8px; font-size: 14px; line-height: 1.6; margin: 0;">${m}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af; margin: 0;">Submitted ${escapeHtml(submittedAt)}</p>
      </div>
    </div>
  `;
}

// POST /api/contact
router.post("/", async (req, res) => {
  try {
    // ---- 1. Validate ----
    const error = validate(req.body || {});
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    // ---- 2. Make sure the database is reachable ----
    if (mongoose.connection.readyState !== 1) {
      console.error("Contact route: MongoDB not connected");
      return res.status(503).json({
        success: false,
        message: "Service temporarily unavailable. Please try again shortly.",
      });
    }

    const { name, email, phone, message } = req.body;

    // ---- 3. Save the lead first (so it is never lost if email fails) ----
    const contact = await Contact.create({ name, email, phone, message });

    const submittedAt = new Date(contact.createdAt).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });

    // ---- 4. Send the notification email in the background ----
    // The visitor gets an instant response; a slow/blocked mail server can't
    // make the form hang. The outcome is logged and stored as emailStatus.
    const notifyAddress =
      process.env.NOTIFY_EMAIL || "innovexastudios2026@gmail.com";

    sendMail({
      to: notifyAddress,
      replyTo: contact.email,
      subject: `New Lead: ${singleLine(contact.name)} — INNOVEXA STUDIOS Contact Form`,
      text:
        `New contact form submission:\n\n` +
        `Name: ${contact.name}\n` +
        `Email: ${contact.email}\n` +
        `Phone: ${contact.phone}\n` +
        `Message:\n${contact.message}\n\n` +
        `Submitted: ${submittedAt}`,
      html: buildNotificationEmail({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        message: contact.message,
        submittedAt,
      }),
    })
      .then(() => Contact.updateOne({ _id: contact._id }, { emailStatus: "sent" }))
      .catch(async (mailErr) => {
        console.error("Email notification failed:", mailErr.message);
        try {
          await Contact.updateOne({ _id: contact._id }, { emailStatus: "failed" });
        } catch (_) {
          /* ignore secondary failure */
        }
      });

    // ---- 5. Respond (no database record is echoed back) ----
    return res.status(201).json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      const first = Object.values(err.errors)[0];
      return res.status(400).json({
        success: false,
        message: first?.message || "Invalid form data.",
      });
    }
    console.error("Contact route error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
});

module.exports = router;
