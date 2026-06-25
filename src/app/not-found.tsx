import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-b from-brand-50 to-white px-6 text-center">
      <div>
        <div className="mb-4 text-6xl">🌈</div>
        <p className="font-display text-7xl font-extrabold rainbow-text">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">Page not found</h1>
        <p className="mt-2 text-muted">The page you are looking for does not exist or has moved.</p>
        <Link
          href="/"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-brand-600 px-7 font-bold text-white transition hover:bg-brand-700"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
