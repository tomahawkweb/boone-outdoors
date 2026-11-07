import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogList } from "@/components/catalog-list";
import type { ProductUse } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Fishing",
  description: "Artificial bait, plus hats and shirts for a day on the water.",
};

export default function FishingPage({
  searchParams,
}: {
  searchParams: Promise<{ max?: string; use?: string }>;
}) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-10">Loading fishing gear…</p>}>
      <FishingCatalog searchParams={searchParams} />
    </Suspense>
  );
}

async function FishingCatalog({
  searchParams,
}: {
  searchParams: Promise<{ max?: string; use?: string }>;
}) {
  const { max, use } = await searchParams;
  const selected: ProductUse | undefined = use === "bait" || use === "apparel" ? use : undefined;

  return (
    <CatalogList
      department="fishing"
      title="Fishing"
      intro="Artificial bait for the bank. Hats and shirts from Wear are listed here too, because they belong on the water."
      maxCents={max === "4000" ? 4000 : undefined}
      use={selected}
    />
  );
}
