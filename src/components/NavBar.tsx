"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type IconProps = { className?: string };

function HomeIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}
function CompareIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M7 4v16M17 4v16" />
      <path d="M4 8l3-3 3 3" />
      <path d="M20 16l-3 3-3-3" />
    </svg>
  );
}
function DecisionIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" />
    </svg>
  );
}
function MoreIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  );
}
function CalcIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M16 15h0M8 19h6" />
    </svg>
  );
}
function ExportIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 3v12" />
      <path d="M7 8l5-5 5 5" />
      <path d="M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}
function SettingsIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.4 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.4l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1A2 2 0 1 1 19.6 7l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}
function PlusIcon({ className = "w-7 h-7" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

const topLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/compare", label: "Compare" },
  { href: "/calc", label: "Cost calc" },
  { href: "/decision", label: "Decision" },
  { href: "/export", label: "Export" },
  { href: "/settings", label: "Settings" },
];

const moreLinks = [
  { href: "/calc", label: "Cost calculator", icon: CalcIcon },
  { href: "/export", label: "Export", icon: ExportIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function NavBar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  // Close the sheet on navigation
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  // Lock body scroll while the sheet is open
  useEffect(() => {
    if (!moreOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [moreOpen]);

  // Escape to close
  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  const moreActive =
    isActive(pathname, "/calc") ||
    isActive(pathname, "/export") ||
    isActive(pathname, "/settings");

  return (
    <>
      {/* Desktop / tablet top bar */}
      <nav className="no-print hidden md:block border-b border-[var(--border)] bg-[var(--card)] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold min-h-[44px]"
          >
            <span className="inline-block w-7 h-7 rounded-md bg-[var(--accent)] text-white grid place-items-center text-xs">
              AF
            </span>
            <span>Apartment Finder</span>
          </Link>
          <div className="flex items-center gap-1">
            {topLinks.map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    active
                      ? "bg-[var(--accent)] text-white"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            <Link
              href="/apartments/new"
              className="ml-2 px-3 py-1.5 rounded-md bg-emerald-700 text-white text-sm hover:bg-emerald-800"
            >
              + Add Apartment
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile compact top bar (logo only). Sticky so it stays put while scrolling. */}
      <nav
        className="no-print md:hidden sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur safe-top"
        aria-label="Top"
      >
        <div className="flex items-center justify-between h-12 px-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold min-h-[44px]"
          >
            <span className="inline-block w-7 h-7 rounded-md bg-[var(--accent)] text-white grid place-items-center text-xs">
              AF
            </span>
            <span className="text-base">Apartment Finder</span>
          </Link>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav
        className="no-print md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--border)] bg-[var(--card)]/95 backdrop-blur"
        style={{
          height: "calc(var(--bottom-nav-h) + var(--safe-bottom))",
          paddingBottom: "var(--safe-bottom)",
        }}
        aria-label="Primary"
      >
        <ul className="grid grid-cols-5 h-[var(--bottom-nav-h)]">
          <TabLink
            href="/"
            label="Home"
            active={isActive(pathname, "/")}
            Icon={HomeIcon}
          />
          <TabLink
            href="/compare"
            label="Compare"
            active={isActive(pathname, "/compare")}
            Icon={CompareIcon}
          />
          <li className="grid place-items-center">
            <Link
              href="/apartments/new"
              aria-label="Add apartment"
              className="-mt-5 w-14 h-14 rounded-full bg-emerald-600 text-white grid place-items-center shadow-lg active:scale-95 transition-transform"
            >
              <PlusIcon className="w-7 h-7" />
            </Link>
          </li>
          <TabLink
            href="/decision"
            label="Decision"
            active={isActive(pathname, "/decision")}
            Icon={DecisionIcon}
          />
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="menu"
              aria-expanded={moreOpen}
              aria-label="More"
              className={`w-full h-full flex flex-col items-center justify-center gap-0.5 text-[11px] ${
                moreActive
                  ? "text-[var(--accent)] font-medium"
                  : "text-slate-500"
              }`}
            >
              <MoreIcon />
              <span>More</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Mobile"More"bottom sheet */}
      {moreOpen && (
        <div
          className="md:hidden fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="More options"
        >
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMoreOpen(false)}
          />
          <div
            className="absolute inset-x-0 bottom-0 bg-[var(--card)] rounded-t-2xl shadow-2xl border-t border-[var(--border)]"
            style={{ paddingBottom: "var(--safe-bottom)" }}
          >
            <div className="flex justify-center pt-2">
              <span className="w-10 h-1.5 rounded-full bg-slate-300" />
            </div>
            <ul className="p-2">
              {moreLinks.map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base min-h-[48px] ${
                        active
                          ? "bg-[var(--accent)]/10 text-[var(--accent)] font-medium"
                          : "text-[var(--foreground)] hover:bg-slate-100"
                      }`}
                      onClick={() => setMoreOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

function TabLink({
  href,
  label,
  active,
  Icon,
}: {
  href: string;
  label: string;
  active: boolean;
  Icon: (p: IconProps) => React.ReactElement;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`w-full h-full flex flex-col items-center justify-center gap-0.5 text-[11px] ${
          active ? "text-[var(--accent)] font-medium" : "text-slate-500"
        }`}
      >
        <Icon />
        <span>{label}</span>
      </Link>
    </li>
  );
}
