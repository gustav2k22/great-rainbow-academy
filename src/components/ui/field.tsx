import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-xl border border-brand-200 bg-white px-4 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 disabled:opacity-60";

export function Label({ children, htmlFor, required }: { children: React.ReactNode; htmlFor?: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-ink">
      {children}
      {required && <span className="text-rainbow-red"> *</span>}
    </label>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, "min-h-28 py-3", className)} {...props} />;
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(fieldBase, "h-11", className)} {...props}>
      {children}
    </select>
  );
}

export function FormField({
  label,
  htmlFor,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
    </div>
  );
}
