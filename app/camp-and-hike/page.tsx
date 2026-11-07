import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogList } from "@/components/catalog-list";

export const metadata: Metadata = {
  title: "Camp & Hike",
  description: "Mugs, bottles, a lantern, and a sit pad for the trail.",
};

export default function CampPage({
  searchParams,
}: {
  searchParams: Promise<{ max?: string; use?: string }>;
}) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-10">Loading camp kit…</p>}>
      <CampCatalog searchParams={searchParams} />
    </Suspense>
  );
}

async function CampCatalog({
  searchParams,
}: {
  searchParams: Promise<{ max?: string; use?: string }>;
}) {
  const { max, use } = await searchParams;
  const selected = use === "light" || use === "water" || use === "field" ? use : undefined;

  return (
    <CatalogList
      department="camp-and-hike"
      title="Camp & Hike"
      intro="Small camp kit. Light and water live here until each has enough products for its own page."
      maxCents={max === "4000" ? 4000 : undefined}
      use={selected}
    />
  );
}
