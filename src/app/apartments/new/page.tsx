"use client";

import { useMemo } from "react";
import { v4 as uuid } from "uuid";
import { emptyApartment } from "@/lib/types";
import { ApartmentForm } from "@/components/ApartmentForm";

export default function NewApartmentPage() {
  const initial = useMemo(
    () => ({ ...emptyApartment(), id: uuid(), rank: 999 }),
    []
  );
  return <ApartmentForm initial={initial} mode="new" />;
}
