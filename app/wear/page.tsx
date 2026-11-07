import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogList } from "@/components/catalog-list";
import type { ProductUse } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Wear",
  description: "Hats, shirts, and stone bead bracelets.",
};

export default function WearPage({
  searchParams,
}: {
  searchParams: Promise<{ max?: string; use?: string }>;
}) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-10">Loading wear…</p>}>
      <WearCatalog searchParams={searchParams} />
    </Suspense>
  );
}

async function WearCatalog({
  searchParams,
}: {
  searchParams: Promise<{ max?: string; use?: string }>;
}) {
  const { max, use } = await searchParams;
  const selected: ProductUse | undefined = use === "apparel" || use === "bracelet" ? use : undefined;

  return (
    <CatalogList
      department="wear"
      title="Wear"
      intro="Hats, shirts, and a stone bead bracelet for the trail and the water."
      maxCents={max === "4000" ? 4000 : undefined}
      use={selected}
    />
  );
}
