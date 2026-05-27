"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import {
  DEFAULT_WEIGHTS,
  SCORE_CATEGORY_LABELS,
  ScoreWeights,
} from "@/lib/types";
import { Card, SectionHeading } from "@/components/ui";

export default function SettingsPage() {
  const { state, ready, updateWeights, resetToSeed, importJSON, exportJSON } =
    useStore();
  const [weights, setLocalWeights] = useState<ScoreWeights>(state.weights);
  const [importText, setImportText] = useState("");
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!ready)
    return <div className="text-sm text-[var(--muted)]">Loading…</div>;

  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  const setW = (k: keyof ScoreWeights, v: number) =>
    setLocalWeights((w) => ({ ...w, [k]: v }));

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>

      <Card className="p-4 sm:p-5 space-y-4">
        <SectionHeading
          right={
            <span
              className={`text-xs ${
                total === 100 ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              total: {total}
              {""}
              {total !== 100 && "(normalized when applied)"}
            </span>
          }
        >
          Scoring weights
        </SectionHeading>
        <p className="text-xs text-[var(--muted)]">
          Adjust how much each category contributes to the overall score.
          Sliders run 0–40; total need not equal 100.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.keys(weights) as (keyof ScoreWeights)[]).map((k) => (
            <div key={k} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{SCORE_CATEGORY_LABELS[k]}</span>
                <span className="text-[var(--muted)] tabular-nums">
                  {weights[k]}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={weights[k]}
                onChange={(e) => setW(k, parseInt(e.target.value, 10))}
                className="w-full"
                aria-label={`${SCORE_CATEGORY_LABELS[k]} weight`}
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => updateWeights(weights)}
            className="min-h-[44px] px-3 rounded bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-800"
          >
            Apply weights
          </button>
          <button
            onClick={() => {
              setLocalWeights(DEFAULT_WEIGHTS);
              updateWeights(DEFAULT_WEIGHTS);
            }}
            className="min-h-[44px] px-3 rounded border border-[var(--border)] text-sm"
          >
            Reset to defaults
          </button>
        </div>
      </Card>

      <Card className="p-4 sm:p-5 space-y-3">
        <SectionHeading>Data backup &amp; restore</SectionHeading>
        <p className="text-xs text-[var(--muted)]">
          Use export/import to back up or sync between devices.
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          <button
            onClick={() => {
              const json = exportJSON();
              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `apartments-${new Date()
                .toISOString()
                .slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="min-h-[44px] px-3 rounded bg-slate-900 text-white text-sm font-medium"
          >
            Download backup JSON
          </button>
          <button
            onClick={() => {
              if (
                confirm(
                  "Reset all data to the seeded list of 10 SLC apartments? Your edits will be lost.",
                )
              )
                resetToSeed();
            }}
            className="min-h-[44px] px-3 rounded border border-rose-300 text-rose-700 text-sm"
          >
            Reset to seeded data
          </button>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="import-json"
            className="text-xs text-[var(--muted)] uppercase"
          >
            Import JSON
          </label>
          <textarea
            id="import-json"
            rows={5}
            placeholder="Paste exported JSON here…"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const res = importJSON(importText);
                setImportStatus(
                  res.ok ? "Imported successfully." : `Failed: ${res.error}`,
                );
                if (res.ok) setImportText("");
              }}
              className="min-h-[44px] px-3 rounded bg-slate-900 text-white text-sm font-medium"
            >
              Import
            </button>
            {importStatus && (
              <span
                className={`text-xs ${
                  importStatus.startsWith("Imported")
                    ? "text-emerald-700"
                    : "text-rose-700"
                }`}
              >
                {importStatus}
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
