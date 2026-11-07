import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogList } from "@/components/catalog-list";

export const metadata: Metadata = {
  title: "Carry",
  description: "Pouches and organizers for the small things in a pack.",
};

export default function CarryPage({
  searchParams,
}: {
  searchParams: Promise<{ max?: string }>;
}) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-10">Loading carry goods…</p>}>
      <CarryCatalog searchParams={searchParams} />
    </Suspense>
  );
}

async function CarryCatalog({ searchParams }: { searchParams: Promise<{ max?: string }> }) {
  const { max } = await searchParams;

  return (
    <CatalogList
      department="carry"
      title="Carry"
      intro="Pouches and organizers for the small things that get lost in a larger bag."
      maxCents={max === "4000" ? 4000 : undefined}
    />
  );
}
