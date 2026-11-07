import type { Metadata } from "next";
import Link from "next/link";
import { guides } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Field guides",
  description: "Short packing lists that point at gear we can ship.",
};

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-5xl tracking-tight">Field guides</h1>
      <p className="mt-3 max-w-xl text-lg text-ink/80">
        Two lists to start. Each one ends on products in the shop.
      </p>
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {guides.map((guide) => (
          <li key={guide.slug} className="border border-line bg-paper p-6">
            <h2 className="font-serif text-3xl">
              <Link href={`/guides/${guide.slug}`}>{guide.title}</Link>
            </h2>
            <p className="mt-3 text-ink/80">{guide.dek}</p>
            <Link href={`/guides/${guide.slug}`} className="mt-4 inline-block text-sm text-pine underline">
              Read the guide
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
