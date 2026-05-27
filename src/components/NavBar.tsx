"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/compare", label: "Compare" },
  { href: "/calc", label: "Cost calc" },
  { href: "/decision", label: "Decision" },
  { href: "/export", label: "Export" },
  { href: "/settings", label: "Settings" },
];

export function NavBar() {
  const pathname = usePathname();
  return (
    <nav className="no-print border-b border-[var(--border)] bg-[var(--card)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-block w-7 h-7 rounded-md bg-[var(--accent)] text-white grid place-items-center text-xs">
            AF
          </span>
          <span>Apartment Finder</span>
        </Link>
        <div className="flex items-center gap-1">
          {links.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
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
            className="ml-2 px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700"
          >
            + Add Apartment
          </Link>
        </div>
      </div>
    </nav>
  );
}
