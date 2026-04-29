import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "neutral";
  className?: string;
  dot?: boolean;
}

const variants: Record<string, string> = {
  default: "bg-blue-50 text-blue-700 border border-blue-200",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  danger: "bg-red-50 text-red-700 border border-red-200",
  info: "bg-blue-50 text-blue-700 border border-blue-200",
  neutral: "bg-slate-100 text-slate-600 border border-slate-200",
};

const dotColors: Record<string, string> = {
  default: "bg-blue-500", success: "bg-emerald-500", warning: "bg-amber-500",
  danger: "bg-red-500", info: "bg-blue-500", neutral: "bg-slate-400",
};

export default function Badge({ children, variant = "default", className = "", dot = false }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}
