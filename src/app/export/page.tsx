"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Exports</h1>
        <p className="text-sm text-[var(--muted)]">
          Generate a polished PDF, copy a Google Docs–ready table, or download
          CSV / JSON.
        </p>
      </div>

      <Card className="p-5 space-y-3">
        <SectionHeading>Polished PDF report</SectionHeading>
        <p className="text-sm text-[var(--muted)]">
          Includes executive summary, comparison table, per-apartment profiles,
          rankings &amp; reasoning, and research notes.
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
            className="inline-block px-4 py-2 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700"
          >
            {({ loading }) => (loading ? "Preparing PDF…" : "Download PDF")}
          </PDFDownloadLink>
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <SectionHeading
          right={
            copyStatus && (
              <span
                className={`text-xs ${
                  copyStatus.startsWith("Copied")
                    ? "text-emerald-700"
                    : "text-rose-700"
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
          will preserve as a real table.
        </p>
        <div className="flex gap-2">
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
            className="px-3 py-1.5 rounded bg-slate-900 text-white text-sm"
          >
            Copy table to clipboard
          </button>
          <button
            onClick={() => setShowPreview((p) => !p)}
            className="px-3 py-1.5 rounded border border-slate-300 text-sm"
          >
            {showPreview ? "Hide preview" : "Show preview"}
          </button>
        </div>
        {showPreview && (
          <div
            className="border border-slate-200 rounded p-2 overflow-x-auto bg-white"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </Card>

      <Card className="p-5 space-y-3">
        <SectionHeading>Raw data</SectionHeading>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() =>
              download(
                `apartments-${today}.csv`,
                apartmentsToCSV(state.apartments),
                "text/csv"
              )
            }
            className="px-3 py-1.5 rounded bg-slate-900 text-white text-sm"
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
            className="px-3 py-1.5 rounded bg-slate-900 text-white text-sm"
          >
            Download JSON
          </button>
          <a
            href="/calc"
            className="px-3 py-1.5 rounded border border-slate-300 text-sm"
          >
            Cost calculator →
          </a>
        </div>
      </Card>
    </div>
  );
}
