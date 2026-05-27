import { ApartmentStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: ApartmentStatus }) {
  const colors: Record<ApartmentStatus, string> = {
    Interested: "bg-slate-100 text-slate-700",
    "Strong contender": "bg-emerald-100 text-emerald-800",
    "Needs research": "bg-amber-100 text-amber-800",
    "Scheduled tour": "bg-blue-100 text-blue-800",
    Applied: "bg-purple-100 text-purple-800",
    Rejected: "bg-rose-100 text-rose-700",
    Archived: "bg-slate-100 text-slate-500",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${colors[status]}`}
    >
      {status}
    </span>
  );
}

export function ScorePill({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-400 text-xs">
        —
      </span>
    );
  }
  const color =
    score >= 8
      ? "bg-emerald-500"
      : score >= 6.5
      ? "bg-blue-500"
      : score >= 5
      ? "bg-amber-500"
      : "bg-rose-500";
  return (
    <span
      className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-semibold ${color}`}
    >
      {score.toFixed(1)}
    </span>
  );
}

export function RankBadge({ rank }: { rank: number }) {
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold">
      #{rank}
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg font-semibold">{children}</h2>
      {right}
    </div>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">
      {children}
    </span>
  );
}

export function RedFlagBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-rose-100 text-rose-700 font-medium">
      ⚠ {count} red flag{count > 1 ? "s" : ""}
    </span>
  );
}

export function fmtMoney(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return `$${n.toLocaleString()}`;
}

export function fmtSqft(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return `${n.toLocaleString()} sqft`;
}
