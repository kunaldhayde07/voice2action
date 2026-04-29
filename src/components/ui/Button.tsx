"use client";
import React from "react";
import Spinner from "./Spinner";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export default function Button({ variant = "primary", size = "md", loading = false, icon, children, className = "", disabled, ...rest }: ButtonProps) {
  const variants: Record<string, string> = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-800",
    ghost: "hover:bg-slate-100 text-slate-600 hover:text-slate-900",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm",
    outline: "border border-slate-300 hover:bg-slate-50 text-slate-700",
  };
  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-xl",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Spinner size="sm" /> : icon}
      {children}
    </button>
  );
}
