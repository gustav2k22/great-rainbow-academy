"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { FormField, Input, Select, Textarea } from "@/components/ui/field";
import { submitAdmission, type ActionResult } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-600 font-bold text-white transition hover:bg-brand-700 disabled:opacity-70"
    >
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
      Submit Application
    </button>
  );
}

export function AdmissionForm({ levels }: { levels: string[] }) {
  const [state, action] = useActionState<ActionResult | null, FormData>(submitAdmission, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      toast.success(state.message);
      ref.current?.reset();
    } else if (state && !state.ok) {
      toast.error(state.message);
    }
  }, [state]);

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl bg-rainbow-green/10 p-10 text-center ring-1 ring-rainbow-green/30">
        <CheckCircle2 className="h-12 w-12 text-rainbow-green" />
        <h3 className="font-display text-xl font-bold text-ink">Application Received</h3>
        <p className="max-w-md text-sm text-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <form ref={ref} action={action} className="space-y-4">
      <p className="text-sm font-bold uppercase tracking-wider text-brand-600">Child&apos;s Details</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="First Name" htmlFor="child_first_name" required>
          <Input id="child_first_name" name="child_first_name" required />
        </FormField>
        <FormField label="Last Name" htmlFor="child_last_name" required>
          <Input id="child_last_name" name="child_last_name" required />
        </FormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Gender" htmlFor="gender">
          <Select id="gender" name="gender" defaultValue="">
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Select>
        </FormField>
        <FormField label="Date of Birth" htmlFor="date_of_birth">
          <Input id="date_of_birth" name="date_of_birth" type="date" />
        </FormField>
        <FormField label="Applying For" htmlFor="applying_for">
          <Select id="applying_for" name="applying_for" defaultValue="">
            <option value="">Select level</option>
            {levels.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </Select>
        </FormField>
      </div>

      <p className="pt-2 text-sm font-bold uppercase tracking-wider text-brand-600">Parent / Guardian</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Full Name" htmlFor="parent_name" required>
          <Input id="parent_name" name="parent_name" required />
        </FormField>
        <FormField label="Phone" htmlFor="parent_phone" required>
          <Input id="parent_phone" name="parent_phone" required placeholder="+233 ..." />
        </FormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Email" htmlFor="parent_email">
          <Input id="parent_email" name="parent_email" type="email" />
        </FormField>
        <FormField label="Previous School (if any)" htmlFor="previous_school">
          <Input id="previous_school" name="previous_school" />
        </FormField>
      </div>
      <FormField label="Message" htmlFor="message">
        <Textarea id="message" name="message" placeholder="Anything you would like us to know?" />
      </FormField>
      <Submit />
    </form>
  );
}
