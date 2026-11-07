import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductCard } from "@/components/product-card";
import { ProductPurchase } from "@/components/product-purchase";
import { departmentById, productBySlug, products, relatedProducts } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.summary,
  };
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-10">Loading product…</p>}>
      <ProductDetail params={params} />
    </Suspense>
  );
}

async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();
  const department = departmentById(product.department);
  const related = relatedProducts(product);

  return (
    <article className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm">
        <Link href={department.path} className="text-pine underline">
          {department.label}
        </Link>
      </p>
      <ProductPurchase
        slug={product.slug}
        name={product.name}
        image={product.image}
        colors={product.colors}
        sizes={product.sizes}
      >
        <h1 className="font-serif text-5xl tracking-tight">{product.name}</h1>
        <p className="mt-3 text-lg">{formatMoney(product.priceCents)}</p>
        <p className="mt-4 max-w-lg text-ink/80">{product.summary}</p>
        <dl className="mt-6 grid gap-3 border-y border-line py-4 sm:grid-cols-2">
          {product.specs.map((spec) => (
            <div key={spec.label}>
              <dt className="text-xs uppercase tracking-[0.14em] text-pine">{spec.label}</dt>
              <dd className="mt-1">{spec.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm text-ink/70">
          Supplier sheet. These figures are replaced after we measure a sample.
        </p>
        {product.story.map((paragraph) => (
          <p key={paragraph} className="mt-4 max-w-lg">
            {paragraph}
          </p>
        ))}
      </ProductPurchase>
      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-serif text-3xl">From the same shelf</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
