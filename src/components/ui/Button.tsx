import { cloneElement, isValidElement, type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-cyan-400 text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.32)] hover:bg-cyan-300",
  secondary:
    "border border-slate-700 bg-slate-900/60 text-slate-100 hover:border-cyan-400/40 hover:text-cyan-200",
  ghost:
    "border border-cyan-400/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const baseClasses = `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      className: `${baseClasses} ${children.props.className ?? ""}`.trim(),
    });
  }

  return (
    <button
      className={baseClasses}
      {...props}
    >
      {children}
    </button>
  );
}
