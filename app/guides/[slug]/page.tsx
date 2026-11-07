import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductCard } from "@/components/product-card";
import { guideBySlug, guides, productBySlug } from "@/lib/catalog";

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) return { title: "Guide" };
  return { title: guide.title, description: guide.dek };
}

export default function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-10">Loading guide…</p>}>
      <GuideDetail params={params} />
    </Suspense>
  );
}

async function GuideDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) notFound();
  const listed = guide.productSlugs
    .map((productSlug) => productBySlug(productSlug))
    .filter((product) => product !== undefined);

  return (
    <article className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm">
        <Link href="/guides" className="text-pine underline">
          Field guides
        </Link>
      </p>
      <h1 className="mt-4 max-w-2xl font-serif text-5xl tracking-tight">{guide.title}</h1>
      <p className="mt-4 max-w-xl text-lg text-ink/80">{guide.dek}</p>
      <div className="mt-6 max-w-xl space-y-4">
        {guide.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <h2 className="mt-12 font-serif text-3xl">In this kit</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {listed.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </article>
  );
}
