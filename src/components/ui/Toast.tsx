"use client";
import { ToastType } from "@/hooks/useToast";

interface ToastItem { id: string; message: string; type: ToastType; }
interface Props { toasts: ToastItem[]; onRemove: (id: string) => void; }

const cfg: Record<string, { bg: string; text: string; icon: string; iconBg: string }> = {
  success: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800", icon: "✓", iconBg: "bg-emerald-100 text-emerald-600" },
  error:   { bg: "bg-red-50 border-red-200",         text: "text-red-800",     icon: "✕", iconBg: "bg-red-100 text-red-600" },
  info:    { bg: "bg-blue-50 border-blue-200",        text: "text-blue-800",    icon: "i", iconBg: "bg-blue-100 text-blue-600" },
  warning: { bg: "bg-amber-50 border-amber-200",      text: "text-amber-800",   icon: "!", iconBg: "bg-amber-100 text-amber-600" },
};

export default function ToastContainer({ toasts, onRemove }: Props) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((t) => {
        const c = cfg[t.type];
        return (
          <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm ${c.bg}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${c.iconBg}`}>{c.icon}</span>
            <p className={`text-sm font-medium flex-1 ${c.text}`}>{t.message}</p>
            <button onClick={() => onRemove(t.id)} className={`text-sm opacity-60 hover:opacity-100 ${c.text}`}>×</button>
          </div>
        );
      })}
    </div>
  );
}
