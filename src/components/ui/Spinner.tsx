export default function Spinner({ size = "md", className = "" }: { size?: "sm"|"md"|"lg"; className?: string }) {
  const sizes: Record<string, string> = { sm: "w-4 h-4 border-2", md: "w-6 h-6 border-2", lg: "w-10 h-10 border-4" };
  return <div className={`rounded-full border-slate-200 border-t-blue-600 animate-spin ${sizes[size]} ${className}`} />;
}
