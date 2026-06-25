import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { dispatch, baseEmail, detailsTable, row, type Channel } from "@/lib/messaging";

interface EventPref {
  enabled: boolean;
  channels: Channel[];
  ack_applicant?: boolean;
  welcome?: boolean;
}
interface Messaging {
  default_channels: Channel[];
  notify_emails: string[];
  notify_phones: string[];
  events: Record<string, EventPref>;
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function getMessaging(): Promise<Messaging> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("site_settings").select("messaging").eq("id", 1).maybeSingle();
  const m = (data?.messaging ?? {}) as Partial<Messaging>;
  return {
    default_channels: m.default_channels ?? ["email"],
    notify_emails: m.notify_emails ?? [],
    notify_phones: m.notify_phones ?? [],
    events: m.events ?? {},
  };
}

function pref(m: Messaging, key: string): EventPref {
  return m.events[key] ?? { enabled: true, channels: m.default_channels };
}

/** New admission application: alert staff + optional applicant acknowledgement. */
export async function notifyAdmissionSubmitted(app: {
  reference: string;
  child_first_name: string;
  child_last_name: string;
  applying_for?: string | null;
  parent_name: string;
  parent_phone: string;
  parent_email?: string | null;
}) {
  const m = await getMessaging();
  const p = pref(m, "admission_submitted");
  if (!p.enabled) return;

  const child = `${app.child_first_name} ${app.child_last_name}`;
  const adminHtml = baseEmail({
    heading: "New Admission Application",
    intro: `A new application has been submitted on the website.`,
    bodyHtml:
      detailsTable(
        row("Reference", app.reference) +
          row("Child", child) +
          row("Applying for", app.applying_for || "Not specified") +
          row("Parent/Guardian", app.parent_name) +
          row("Phone", app.parent_phone) +
          row("Email", app.parent_email || "Not provided")
      ) +
      `<p style="margin-top:14px;"><a href="${SITE}/dashboard/admissions" style="display:inline-block;background:#7c3aed;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:700;">Review in Dashboard</a></p>`,
  });

  await dispatch({
    channels: p.channels,
    category: "admission",
    emails: m.notify_emails,
    phones: m.notify_phones,
    email: { subject: `New admission application: ${child}`, html: adminHtml },
    smsMessage: `New admission application from ${app.parent_name} for ${child} (${app.reference}). Review on the dashboard.`,
  });

  // Acknowledgement to the applicant (email only)
  if (p.ack_applicant && app.parent_email) {
    const ackHtml = baseEmail({
      heading: "We received your application 🎉",
      intro: `Dear ${app.parent_name}, thank you for choosing Great Rainbow Academy.`,
      bodyHtml: `<p>We have received your admission application for <strong>${child}</strong>. Your reference number is <strong>${app.reference}</strong>.</p>
        <p>Our admissions team will contact you shortly to continue the process. If you have any questions, simply reply to this email.</p>
        <p style="margin-top:10px;">Warm regards,<br/>The Admissions Team</p>`,
    });
    await dispatch({
      channels: ["email"],
      category: "admission",
      emails: [app.parent_email],
      email: { subject: "Your application to Great Rainbow Academy", html: ackHtml },
    });
  }
}

/** New contact message: alert staff. */
export async function notifyContactSubmitted(msg: {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
}) {
  const m = await getMessaging();
  const p = pref(m, "contact_submitted");
  if (!p.enabled) return;

  const html = baseEmail({
    heading: "New Contact Message",
    intro: "Someone reached out through the website contact form.",
    bodyHtml:
      detailsTable(
        row("Name", msg.name) + row("Email", msg.email) + row("Phone", msg.phone || "Not provided") + row("Subject", msg.subject || "No subject")
      ) +
      `<p style="margin-top:12px;white-space:pre-wrap;background:#fff;border:1px solid #ede9fe;border-radius:12px;padding:14px;">${escapeHtml(msg.message)}</p>` +
      `<p style="margin-top:14px;"><a href="${SITE}/dashboard/messages" style="display:inline-block;background:#7c3aed;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:700;">Open Inbox</a></p>`,
  });

  await dispatch({
    channels: p.channels,
    category: "contact",
    emails: m.notify_emails,
    phones: m.notify_phones,
    email: { subject: `New message from ${msg.name}`, html, replyTo: msg.email },
    smsMessage: `New website message from ${msg.name} (${msg.email}). Check the dashboard inbox.`,
  });
}

/** New newsletter subscriber: optional welcome email. */
export async function notifyNewSubscriber(sub: { email: string; full_name?: string | null }) {
  const m = await getMessaging();
  const p = pref(m, "newsletter_subscribed");
  if (!p.enabled || !p.welcome) return;

  const html = baseEmail({
    heading: "Welcome to our newsletter 🌈",
    intro: `Hi ${sub.full_name || "there"}, thanks for subscribing!`,
    bodyHtml: `<p>You will now receive news, events and updates from Great Rainbow Academy straight to your inbox.</p>
      <p>We are glad to have you in the Rainbow family.</p>`,
  });
  await dispatch({
    channels: ["email"],
    category: "subscribe",
    emails: [sub.email],
    email: { subject: "Welcome to Great Rainbow Academy", html },
  });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
}
