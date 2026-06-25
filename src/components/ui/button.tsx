import { forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "white" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 shadow-[0_8px_24px_-8px_rgba(124,58,237,0.6)]",
  secondary: "bg-brand-100 text-brand-700 hover:bg-brand-200",
  outline: "border-2 border-brand-200 text-brand-700 hover:border-brand-400 hover:bg-brand-50",
  ghost: "text-brand-700 hover:bg-brand-50",
  white: "bg-white text-brand-700 hover:bg-brand-50 shadow-lg",
  danger: "bg-red-500 text-white hover:bg-red-600",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-6 text-sm gap-2",
  lg: "h-13 px-8 text-base gap-2.5",
};

const base =
  "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none active:scale-[0.97]";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
}

export const Button = forwardRef<
  HTMLButtonElement,
  CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>(function Button({ variant = "primary", size = "md", className, ...props }, ref) {
  return <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />;
});

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: CommonProps & React.ComponentProps<typeof Link>) {
  return <Link className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
