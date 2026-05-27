"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Card, SectionHeading } from "@/components/ui";
import {
  apartmentsToCSV,
  copyHTMLToClipboard,
  googleDocsRowsToHTML,
  toGoogleDocsRows,
} from "@/lib/export";
import { PdfReport } from "@/components/PdfReport";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFDownloadLink),
  { ssr: false }
);

export default function ExportPage() {
  const { state, ready, exportJSON } = useStore();
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Clear copy status after a short delay so it doesn't linger
  useEffect(() => {
    if (!copyStatus) return;
    const t = setTimeout(() => setCopyStatus(null), 3500);
    return () => clearTimeout(t);
  }, [copyStatus]);

  const rows = useMemo(
    () => toGoogleDocsRows(state.apartments),
    [state.apartments]
  );
  const html = useMemo(() => googleDocsRowsToHTML(rows), [rows]);
  const plain = useMemo(
    () =>
      [
        "Rank\tProperty\tNeighborhood\tRent\tUnit\tAll-in\tPros\tCons\tFlags",
        ...rows.map((r) =>
          [
            r.rank,
            r.name,
            r.addressNeighborhood,
            r.rent,
            r.unitType,
            r.pros,
            r.cons,
            r.redFlags,
          ].join("\t")
        ),
      ].join("\n"),
    [rows]
  );

  if (!ready)
    return <div className="text-sm text-[var(--muted)]">Loading…</div>;

  const download = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Exports</h1>
        <p className="text-sm text-[var(--muted)]">
          Generate a polished PDF, copy a Google Docs–ready table, or download
          CSV / JSON.
        </p>
      </div>

      <Card className="p-4 sm:p-5 space-y-3">
        <SectionHeading>Polished PDF report</SectionHeading>
        <p className="text-sm text-[var(--muted)]">
          Includes executive summary, comparison table, per-apartment profiles,
          rankings &amp; reasoning, and research notes. May take a few seconds
          on mobile.
        </p>
        <div>
          <PDFDownloadLink
            document={
              <PdfReport
                apartments={state.apartments}
                weights={state.weights}
              />
            }
            fileName={`apartment-report-${today}.pdf`}
            className="inline-flex items-center justify-center min-h-[48px] px-4 rounded bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 w-full sm:w-auto"
          >
            {({ loading }) =>
              loading ? "Preparing PDF…" : "Download PDF report"
            }
          </PDFDownloadLink>
        </div>
      </Card>

      <Card className="p-4 sm:p-5 space-y-3">
        <SectionHeading
          right={
            copyStatus && (
              <span
                className={`text-xs ${
                  copyStatus.startsWith("Copied")
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-rose-700 dark:text-rose-300"
                }`}
              >
                {copyStatus}
              </span>
            )
          }
        >
          Google Docs–friendly table
        </SectionHeading>
        <p className="text-sm text-[var(--muted)]">
          Copies styled HTML to your clipboard. Paste into Google Docs and it
          will appear as a real table.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={async () => {
              try {
                await copyHTMLToClipboard(html, plain);
                setCopyStatus("Copied to clipboard.");
              } catch (e) {
                setCopyStatus(
                  e instanceof Error ? `Failed: ${e.message}` : "Copy failed"
                );
              }
            }}
            className="min-h-[44px] px-3 rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium"
          >
            Copy table to clipboard
          </button>
          <button
            onClick={() => setShowPreview((p) => !p)}
            className="min-h-[44px] px-3 rounded border border-[var(--border)] text-sm"
          >
            {showPreview ? "Hide preview" : "Show preview"}
          </button>
        </div>
        {showPreview && (
          <div
            className="border border-slate-200 dark:border-slate-700 rounded p-2 overflow-x-auto bg-white text-slate-900"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </Card>

      <Card className="p-4 sm:p-5 space-y-3">
        <SectionHeading>Raw data</SectionHeading>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          <button
            onClick={() =>
              download(
                `apartments-${today}.csv`,
                apartmentsToCSV(state.apartments),
                "text/csv"
              )
            }
            className="min-h-[44px] px-3 rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium"
          >
            Download CSV
          </button>
          <button
            onClick={() =>
              download(
                `apartments-${today}.json`,
                exportJSON(),
                "application/json"
              )
            }
            className="min-h-[44px] px-3 rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium"
          >
            Download JSON
          </button>
          <a
            href="/calc"
            className="min-h-[44px] inline-flex items-center px-3 rounded border border-[var(--border)] text-sm"
          >
            Cost calculator →
          </a>
        </div>
      </Card>
    </div>
  );
}
