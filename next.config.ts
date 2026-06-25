import type { NextConfig } from "next";

const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://stdfrubkhnovysdikbbi.supabase.co").hostname;
  } catch {
    return "stdfrubkhnovysdikbbi.supabase.co";
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "stdfrubkhnovysdikbbi.storage.supabase.co", pathname: "/**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    serverActions: { bodySizeLimit: "60mb" },
  },
};

export default nextConfig;
