"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Input, Label } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      toast.error(error.message || "Invalid credentials");
      setLoading(false);
      return;
    }
    toast.success("Signed in. Welcome back!");
    router.replace(redirect);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <Label htmlFor="email" required>Email</Label>
        <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@greatrainbowacademy.com" />
      </div>
      <div>
        <Label htmlFor="password" required>Password</Label>
        <div className="relative">
          <Input id="password" type={show ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pr-11" />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-brand-700" aria-label="Toggle password">
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <button type="submit" disabled={loading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-600 font-bold text-white transition hover:bg-brand-700 disabled:opacity-70">
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
        Sign in
      </button>
    </form>
  );
}
