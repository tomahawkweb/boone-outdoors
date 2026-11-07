import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { trendingProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "New & trending",
  description: "Three outdoor products we are featuring this week.",
};

export default function TrendingPage() {
  const products = trendingProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-5xl tracking-tight">New & trending</h1>
      <p className="mt-3 max-w-xl text-lg text-ink/80">
        Three slots. Each one comes down on the date under the name, or sooner if we cannot ship it.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} showTrendNote />
        ))}
      </div>
    </div>
  );
}
