import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogList } from "@/components/catalog-list";

export const metadata: Metadata = {
  title: "Packs & Bags",
  description: "Day packs and slings for a hike or a day in the truck.",
};

export default function PacksPage({
  searchParams,
}: {
  searchParams: Promise<{ max?: string }>;
}) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-10">Loading packs…</p>}>
      <PacksCatalog searchParams={searchParams} />
    </Suspense>
  );
}

async function PacksCatalog({ searchParams }: { searchParams: Promise<{ max?: string }> }) {
  const { max } = await searchParams;

  return (
    <CatalogList
      department="packs-and-bags"
      title="Packs & Bags"
      intro="Day packs and slings sized for a hike, a commute, or the gear that has to come along."
      maxCents={max === "4000" ? 4000 : undefined}
    />
  );
}
