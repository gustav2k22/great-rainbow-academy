"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { FormField, Input, Textarea } from "@/components/ui/field";
import { submitContact, type ActionResult } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-600 font-bold text-white transition hover:bg-brand-700 disabled:opacity-70"
    >
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
      Send Message
    </button>
  );
}

export function ContactForm() {
  const [state, action] = useActionState<ActionResult | null, FormData>(submitContact, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      toast.success(state.message);
      ref.current?.reset();
    } else if (state && !state.ok) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Full Name" htmlFor="name" required>
          <Input id="name" name="name" required placeholder="Jane Doe" />
        </FormField>
        <FormField label="Email" htmlFor="email" required>
          <Input id="email" name="email" type="email" required placeholder="you@email.com" />
        </FormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Phone" htmlFor="phone">
          <Input id="phone" name="phone" placeholder="+233 ..." />
        </FormField>
        <FormField label="Subject" htmlFor="subject">
          <Input id="subject" name="subject" placeholder="Admission enquiry" />
        </FormField>
      </div>
      <FormField label="Message" htmlFor="message" required>
        <Textarea id="message" name="message" required placeholder="How can we help you?" />
      </FormField>
      <Submit />
    </form>
  );
}
