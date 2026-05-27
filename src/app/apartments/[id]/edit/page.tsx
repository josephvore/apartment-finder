"use client";

import { use } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { ApartmentForm } from "@/components/ApartmentForm";

export default function EditApartmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { state, ready } = useStore();
  if (!ready)
    return <div className="text-sm text-[var(--muted)]">Loading…</div>;
  const apt = state.apartments.find((a) => a.id === id);
  if (!apt) {
    return (
      <div>
        <p>Apartment not found.</p>
        <Link href="/" className="underline">
          Back to dashboard
        </Link>
      </div>
    );
  }
  return <ApartmentForm initial={apt} mode="edit" />;
}
