import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/features/auth/login-form";
import { getSiteSettings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Staff Portal Login",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const settings = await getSiteSettings();

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-900 p-12 text-white lg:flex">
        <div className="pointer-events-none absolute -right-20 top-10 h-80 w-80 rounded-full bg-rainbow-violet/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-10 h-80 w-80 rounded-full bg-rainbow-blue/30 blur-3xl" />
        <Link href="/" className="relative flex items-center gap-3">
          {settings?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logo_url} alt="Logo" className="h-12 w-12 rounded-xl bg-white object-contain p-1" />
          ) : (
            <span className="text-3xl">🌈</span>
          )}
          <div>
            <p className="font-display text-lg font-extrabold">Great Rainbow Academy</p>
            <p className="text-xs text-white/60">The Citadel of Learning</p>
          </div>
        </Link>
        <div className="relative">
          <h1 className="font-display text-4xl font-extrabold leading-tight">
            Welcome back to the <span className="rainbow-text">Staff Portal</span>
          </h1>
          <p className="mt-4 max-w-md text-white/70">
            Manage admissions, students, content and everything that keeps Great Rainbow Academy shining.
          </p>
        </div>
        <p className="relative text-sm text-white/50">Discipline and Commitment 🌈</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center bg-gradient-to-b from-brand-50/50 to-white px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800">
            <ArrowLeft className="h-4 w-4" /> Back to website
          </Link>
          <h2 className="font-display text-3xl font-extrabold text-ink">Sign in</h2>
          <p className="mt-2 text-sm text-muted">Enter your staff credentials to continue.</p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
