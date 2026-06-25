"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { subscribeNewsletter, type ActionResult } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-brand-700 transition hover:bg-brand-50 disabled:opacity-70"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      Subscribe
    </button>
  );
}

export function NewsletterForm({ variant = "footer" }: { variant?: "footer" | "card" }) {
  const [state, action] = useActionState<ActionResult | null, FormData>(subscribeNewsletter, null);

  useEffect(() => {
    if (state?.ok) toast.success(state.message);
    else if (state && !state.ok) toast.error(state.message);
  }, [state]);

  if (state?.ok) {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-3 text-sm text-white">
        <CheckCircle2 className="h-5 w-5 flex-none" />
        <span>{state.message}</span>
      </div>
    );
  }

  const emailCls =
    variant === "footer"
      ? "h-11 w-full rounded-full border-0 bg-white/15 px-5 text-sm text-white placeholder:text-white/60 outline-none ring-1 ring-white/20 focus:ring-white/50"
      : "h-11 w-full rounded-full border border-brand-200 bg-white px-5 text-sm outline-none focus:border-brand-400";

  return (
    <form action={action} className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input type="email" name="email" required placeholder="Enter your email" className={emailCls} />
        <SubmitButton />
      </div>
      <input
        type="tel"
        name="phone"
        placeholder="Phone (optional, for SMS updates)"
        className={emailCls + " sm:text-xs"}
      />
    </form>
  );
}
