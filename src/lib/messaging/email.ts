import "server-only";
import { Resend } from "resend";
import nodemailer from "nodemailer";

export interface EmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface SendResult {
  ok: boolean;
  provider: "resend" | "smtp" | "none";
  error?: string;
}

const FROM = process.env.EMAIL_FROM || "Great Rainbow Academy <onboarding@resend.dev>";
const REPLY_TO = process.env.EMAIL_REPLY_TO || undefined;

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY) || Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
}

async function viaResend(input: EmailInput): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, provider: "resend", error: "RESEND_API_KEY not set" };
  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from: FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo ?? REPLY_TO,
    });
    if (error) return { ok: false, provider: "resend", error: error.message };
    return { ok: true, provider: "resend" };
  } catch (e) {
    return { ok: false, provider: "resend", error: e instanceof Error ? e.message : "Resend failed" };
  }
}

async function viaSmtp(input: EmailInput): Promise<SendResult> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user) return { ok: false, provider: "smtp", error: "SMTP not configured" };
  try {
    const transport = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user, pass },
    });
    await transport.sendMail({
      from: FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo ?? REPLY_TO,
    });
    return { ok: true, provider: "smtp" };
  } catch (e) {
    return { ok: false, provider: "smtp", error: e instanceof Error ? e.message : "SMTP failed" };
  }
}

/** Sends an email, preferring Resend and falling back to SMTP. */
export async function sendEmail(input: EmailInput): Promise<SendResult> {
  if (process.env.RESEND_API_KEY) {
    const r = await viaResend(input);
    if (r.ok) return r;
    // fall through to SMTP if available
    if (process.env.SMTP_HOST) {
      const s = await viaSmtp(input);
      if (s.ok) return s;
      return { ok: false, provider: "smtp", error: `Resend: ${r.error}; SMTP: ${s.error}` };
    }
    return r;
  }
  if (process.env.SMTP_HOST) return viaSmtp(input);
  return { ok: false, provider: "none", error: "No email provider configured" };
}
