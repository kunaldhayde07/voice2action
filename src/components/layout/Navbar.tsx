"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavbarProps {
  isConnected?: boolean;
}

export default function Navbar({ isConnected = false }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/feed", label: "Issues Feed" },
    { href: "/report", label: "Report Issue" },
    { href: "/map", label: "Live Map" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200" style={{ backdropFilter: "blur(12px)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link href="/" className="flex items-center gap-3">
            {/* ── Logo: replaced SVG icon with V2A text badge ── */}
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xs tracking-tight leading-none">
                V2A
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">Voice2Action</span>
              <p className="text-xs text-slate-400 leading-none hidden sm:block">
                Civic Intelligence Platform
              </p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  pathname === link.href
                    ? "px-4 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700"
                    : "px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <span
                className={
                  isConnected
                    ? "w-2 h-2 rounded-full bg-emerald-500"
                    : "w-2 h-2 rounded-full bg-slate-300"
                }
              />
              {isConnected ? "Live" : "Offline"}
            </div>

            <Link
              href="/dashboard"
              className="hidden md:flex px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Authority Panel
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white py-3 px-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={
                pathname === link.href
                  ? "block px-4 py-2.5 rounded-xl text-sm font-medium mb-1 bg-blue-50 text-blue-700"
                  : "block px-4 py-2.5 rounded-xl text-sm font-medium mb-1 text-slate-600 hover:bg-slate-100"
              }
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-900 text-white text-center mt-2"
          >
            Authority Panel
          </Link>
        </div>
      )}
    </nav>
  );
}
