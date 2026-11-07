import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCard } from "@/components/product-card";
import { searchCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Daniel Boone Outdoors assortment.",
};

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-10">Searching…</p>}>
      <SearchResults searchParams={searchParams} />
    </Suspense>
  );
}

async function SearchResults({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = searchCatalog(query);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-5xl tracking-tight">Search</h1>
      <form action="/search" className="mt-6 flex max-w-lg gap-2" role="search">
        <label htmlFor="q" className="sr-only">
          Search gear
        </label>
        <input
          id="q"
          name="q"
          defaultValue={query}
          className="min-w-0 flex-1 border border-line bg-paper px-3 py-2"
        />
        <button type="submit" className="bg-pine px-4 py-2 text-sm text-stone">
          Search
        </button>
      </form>
      {query ? (
        <p className="mt-6 text-sm text-ink/75">
          {results.length} {results.length === 1 ? "result" : "results"} for “{query}”
        </p>
      ) : (
        <p className="mt-6 text-sm text-ink/75">Try pack, lantern, pouch, or bottle.</p>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
}
