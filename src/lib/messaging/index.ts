import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, emailConfigured, type EmailInput } from "./email";
import { sendSms, smsConfigured } from "./sms";

export type Channel = "email" | "sms";
export { emailConfigured, smsConfigured };
export * from "./templates";

async function log(entry: {
  channel: Channel;
  category: string;
  recipient: string;
  subject?: string;
  status: "sent" | "failed" | "skipped";
  provider?: string;
  error?: string;
  meta?: Record<string, unknown>;
}) {
  try {
    const supabase = createAdminClient();
    await supabase.from("notifications_log").insert({
      channel: entry.channel,
      category: entry.category,
      recipient: entry.recipient,
      subject: entry.subject ?? null,
      status: entry.status,
      provider: entry.provider ?? null,
      error: entry.error ?? null,
      meta: entry.meta ?? {},
    });
  } catch {
    // logging must never break the request
  }
}

/** Send one email to many recipients, logging each. Returns count delivered. */
export async function dispatchEmail(
  recipients: string[],
  email: Omit<EmailInput, "to">,
  category: string
): Promise<number> {
  let sent = 0;
  const unique = Array.from(new Set(recipients.map((r) => r.trim()).filter(Boolean)));
  for (const to of unique) {
    const res = await sendEmail({ ...email, to });
    await log({
      channel: "email",
      category,
      recipient: to,
      subject: email.subject,
      status: res.ok ? "sent" : res.provider === "none" ? "skipped" : "failed",
      provider: res.provider,
      error: res.error,
    });
    if (res.ok) sent++;
  }
  return sent;
}

/** Send one SMS to many recipients, logging each. Returns count delivered. */
export async function dispatchSms(recipients: string[], message: string, category: string): Promise<number> {
  let sent = 0;
  const unique = Array.from(new Set(recipients.map((r) => r.trim()).filter(Boolean)));
  for (const to of unique) {
    const res = await sendSms({ to, message });
    await log({
      channel: "sms",
      category,
      recipient: to,
      status: res.ok ? "sent" : res.skipped ? "skipped" : "failed",
      provider: res.provider,
      error: res.error,
    });
    if (res.ok) sent++;
  }
  return sent;
}

export interface DispatchResult {
  emailSent: number;
  smsSent: number;
  emailConfigured: boolean;
  smsConfigured: boolean;
}

/**
 * High-level dispatch across selected channels. "neither" => pass empty
 * channels and nothing is sent.
 */
export async function dispatch(opts: {
  channels: Channel[];
  category: string;
  emails?: string[];
  phones?: string[];
  email?: Omit<EmailInput, "to">;
  smsMessage?: string;
}): Promise<DispatchResult> {
  const result: DispatchResult = {
    emailSent: 0,
    smsSent: 0,
    emailConfigured: emailConfigured(),
    smsConfigured: smsConfigured(),
  };
  if (opts.channels.includes("email") && opts.email && opts.emails?.length) {
    result.emailSent = await dispatchEmail(opts.emails, opts.email, opts.category);
  }
  if (opts.channels.includes("sms") && opts.smsMessage && opts.phones?.length) {
    result.smsSent = await dispatchSms(opts.phones, opts.smsMessage, opts.category);
  }
  return result;
}
