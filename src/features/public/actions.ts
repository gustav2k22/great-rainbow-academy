"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type ActionResult = { ok: boolean; message: string };

// ---- Newsletter ------------------------------------------------
const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  full_name: z.string().trim().max(120).optional().or(z.literal("")),
});

export async function subscribeNewsletter(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = subscribeSchema.safeParse({
    email: formData.get("email"),
    full_name: formData.get("full_name") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert(
      { email: parsed.data.email.toLowerCase(), full_name: parsed.data.full_name || null, status: "subscribed" },
      { onConflict: "email" }
    );
  if (error) return { ok: false, message: "Something went wrong. Please try again." };
  return { ok: true, message: "You are subscribed! Watch out for our newsletters." };
}

// ---- Contact ---------------------------------------------------
const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: z.string().email("Please enter a valid email."),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().max(160).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Please write a longer message."),
});

export async function submitContact(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    subject: formData.get("subject") ?? "",
    message: formData.get("message"),
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = createAdminClient();
  const { error } = await supabase.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    subject: parsed.data.subject || null,
    message: parsed.data.message,
  });
  if (error) return { ok: false, message: "Could not send your message. Please try again." };
  return { ok: true, message: "Thank you! Your message has been sent. We will be in touch soon." };
}

// ---- Admission application ------------------------------------
const admissionSchema = z.object({
  child_first_name: z.string().trim().min(1, "Child's first name is required."),
  child_last_name: z.string().trim().min(1, "Child's last name is required."),
  gender: z.enum(["male", "female", "other"]).optional().or(z.literal("")),
  date_of_birth: z.string().optional().or(z.literal("")),
  applying_for: z.string().trim().optional().or(z.literal("")),
  parent_name: z.string().trim().min(2, "Parent/guardian name is required."),
  parent_phone: z.string().trim().min(6, "A valid phone number is required."),
  parent_email: z.string().email("Enter a valid email.").optional().or(z.literal("")),
  previous_school: z.string().trim().optional().or(z.literal("")),
  message: z.string().trim().optional().or(z.literal("")),
});

export async function submitAdmission(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = admissionSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  const d = parsed.data;
  const supabase = createAdminClient();
  const { error } = await supabase.from("admission_applications").insert({
    child_first_name: d.child_first_name,
    child_last_name: d.child_last_name,
    gender: d.gender || null,
    date_of_birth: d.date_of_birth || null,
    applying_for: d.applying_for || null,
    parent_name: d.parent_name,
    parent_phone: d.parent_phone,
    parent_email: d.parent_email || null,
    previous_school: d.previous_school || null,
    message: d.message || null,
  });
  if (error) return { ok: false, message: "Could not submit the application. Please try again." };
  revalidatePath("/dashboard/admissions");
  return { ok: true, message: "Application received! We will contact you shortly to continue the process." };
}
