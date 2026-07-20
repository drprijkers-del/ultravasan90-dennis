"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useI18n, type Locale } from "@/lib/i18n";

const NAV_KEYS = [
  { href: "/", key: "nav.home" },
  { href: "/progress", key: "nav.progress" },
  { href: "/plan", key: "nav.plan" },
] as const;

export function Nav() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);

  const toggleLang = () => setLocale(locale === "nl" ? "sv" : ("nl" as Locale));

  return (
    <nav className="sticky top-0 z-50 border-b border-(--border-primary) bg-(--bg-card)/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-base font-bold tracking-tight text-(--text-primary)">
            UV90
          </span>
          <span className="hidden text-xs text-(--text-muted) sm:inline">
            Dennis Rijkers
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 sm:flex">
          {NAV_KEYS.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-(--bg-inset) text-(--text-primary)"
                    : "text-(--text-muted) hover:text-(--text-secondary)"
                }`}
              >
                {t(link.key)}
              </Link>
            );
          })}
          <button
            onClick={toggleLang}
            className="ml-3 rounded-md border border-(--border-primary) px-2 py-1 text-xs font-medium text-(--text-muted) transition-colors hover:text-(--text-secondary)"
          >
            {locale === "nl" ? "SV" : "NL"}
          </button>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            onClick={toggleLang}
            className="rounded-md border border-(--border-primary) px-2 py-1 text-xs font-medium text-(--text-muted)"
          >
            {locale === "nl" ? "SV" : "NL"}
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="rounded-md p-1.5 text-(--text-muted) hover:text-(--text-secondary)"
            aria-label="Menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-(--border-primary) px-4 py-2 sm:hidden">
          {NAV_KEYS.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? "text-(--text-primary)" : "text-(--text-muted)"
                }`}
              >
                {t(link.key)}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
