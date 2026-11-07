import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop all",
  description: "The full Daniel Boone Outdoors sample assortment.",
};

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-5xl tracking-tight">Shop all gear</h1>
      <p className="mt-3 max-w-xl text-lg text-ink/80">
        Everything on the site right now, from packs and camp kit to bait, hats, shirts, and bracelets.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
}
