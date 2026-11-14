import type { HTMLAttributes, ReactNode } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function GlassCard({ children, className = "", ...props }: GlassCardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-900/60 text-slate-100 shadow-[0_0_25px_rgba(15,23,42,0.35)] backdrop-blur-xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
