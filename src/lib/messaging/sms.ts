import "server-only";

export interface SmsInput {
  to: string;
  message: string;
}
export interface SmsResult {
  ok: boolean;
  provider: "arkesel" | "twilio" | "none";
  error?: string;
  skipped?: boolean;
}

const PROVIDER = (process.env.SMS_PROVIDER || "none").toLowerCase();
const SENDER = process.env.SMS_SENDER_ID || "School";

export function smsConfigured() {
  if (PROVIDER === "arkesel") return Boolean(process.env.ARKESEL_API_KEY);
  if (PROVIDER === "twilio") return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM);
  return false;
}

function normalize(phone: string) {
  return phone.replace(/[\s()-]/g, "");
}

async function viaArkesel(input: SmsInput): Promise<SmsResult> {
  const key = process.env.ARKESEL_API_KEY!;
  try {
    const res = await fetch("https://sms.arkesel.com/api/v2/sms/send", {
      method: "POST",
      headers: { "api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ sender: SENDER, message: input.message, recipients: [normalize(input.to)] }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, provider: "arkesel", error: data?.message || `HTTP ${res.status}` };
    return { ok: true, provider: "arkesel" };
  } catch (e) {
    return { ok: false, provider: "arkesel", error: e instanceof Error ? e.message : "Arkesel failed" };
  }
}

async function viaTwilio(input: SmsInput): Promise<SmsResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const token = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_FROM!;
  try {
    const body = new URLSearchParams({ To: normalize(input.to), From: from, Body: input.message });
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, provider: "twilio", error: data?.message || `HTTP ${res.status}` };
    return { ok: true, provider: "twilio" };
  } catch (e) {
    return { ok: false, provider: "twilio", error: e instanceof Error ? e.message : "Twilio failed" };
  }
}

export async function sendSms(input: SmsInput): Promise<SmsResult> {
  if (!input.to) return { ok: false, provider: "none", skipped: true, error: "No phone number" };
  if (PROVIDER === "arkesel" && process.env.ARKESEL_API_KEY) return viaArkesel(input);
  if (PROVIDER === "twilio" && process.env.TWILIO_ACCOUNT_SID) return viaTwilio(input);
  return { ok: false, provider: "none", skipped: true, error: "No SMS provider configured" };
}
