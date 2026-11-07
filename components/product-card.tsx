import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { departmentById } from "@/lib/catalog";
import { formatDay, formatMoney } from "@/lib/format";

export function ProductCard({ product, showTrendNote = false }: { product: Product; showTrendNote?: boolean }) {
  const spec = product.specs[0];

  return (
    <article className="flex h-full flex-col border border-line bg-paper">
      <Link href={`/products/${product.slug}`} className="flex h-full flex-col p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-pine">{departmentById(product.department).label}</p>
        <h3 className="mt-2 font-serif text-2xl leading-tight">{product.name}</h3>
        <p className="mt-2 text-sm text-ink/80">{product.summary}</p>
        {spec ? (
          <p className="mt-3 text-sm">
            {spec.label}: {spec.value}
          </p>
        ) : null}
        {showTrendNote && product.trendingUntil ? (
          <p className="mt-3 text-sm text-ink/70">Shown through {formatDay(product.trendingUntil)}.</p>
        ) : null}
        <p className="mt-auto pt-4 text-sm font-medium">{formatMoney(product.priceCents)}</p>
      </Link>
    </article>
  );
}
