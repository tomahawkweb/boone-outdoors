import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { evergreenProducts, trendingProducts } from "@/lib/catalog";

const uses = [
  { href: "/packs-and-bags", title: "Packs & Bags", text: "Day packs and slings." },
  { href: "/camp-and-hike", title: "Camp & Hike", text: "Mug, bottle, light, and a pad." },
  { href: "/carry", title: "Carry", text: "Pouches for the small things." },
  { href: "/camp-and-hike?use=field", title: "Light & water", text: "A lantern and something to drink from." },
  { href: "/fishing", title: "Fishing", text: "Bait, plus hats and shirts." },
  { href: "/wear", title: "Wear", text: "Hats, shirts, and stone bracelets." },
];

export default function HomePage() {
  const trending = trendingProducts();
  const evergreen = evergreenProducts();

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-stretch gap-8 px-4 py-8 md:grid-cols-2 md:py-12">
        <div className="flex flex-col justify-center">
          <h1 className="max-w-md font-serif text-5xl leading-[1.05] tracking-tight md:text-6xl">
            Gear for the day ahead.
          </h1>
          <span className="mt-4 block h-0.5 w-12 bg-copper" aria-hidden="true" />
          <p className="mt-4 max-w-md text-lg text-ink/80">
            Packs, camp kit, and carry goods for a hike, a truck, and the week between.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/trending" className="bg-pine px-4 py-2.5 text-sm text-stone">
              Shop trending
            </Link>
            <Link href="/guides/day-hike" className="border border-ink px-4 py-2.5 text-sm">
              Read the guide
            </Link>
          </div>
        </div>
        <div className="relative min-h-72 overflow-hidden bg-pine-deep">
          <Image
            src="/hero-trail.jpg"
            alt="A canvas pack resting beside a pine trail in overcast light"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-3xl">New & trending</h2>
          <Link href="/trending" className="text-sm text-pine underline">
            All three
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {trending.map((product) => (
            <ProductCard key={product.slug} product={product} showTrendNote />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="font-serif text-3xl">Shop by use</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {uses.map((use) => (
            <Link key={use.href} href={use.href} className="border border-line bg-paper p-5 hover:border-pine">
              <span className="block font-serif text-2xl">{use.title}</span>
              <span className="mt-2 block text-sm text-ink/75">{use.text}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div className="border border-line bg-paper p-6 md:p-10">
          <p className="text-xs uppercase tracking-[0.16em] text-pine">Field note</p>
          <h2 className="mt-3 font-serif text-4xl leading-tight">What to pack for a day hike</h2>
          <p className="mt-4 max-w-lg text-ink/80">
            Water, a layer, and a pouch for the small things. A short list for a trail you will finish before dark.
          </p>
          <Link href="/guides/day-hike" className="mt-6 inline-block text-sm text-pine underline">
            Read the guide
          </Link>
        </div>
        <div>
          <h2 className="font-serif text-3xl">Always in the kit</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {evergreen.map((product) => (
              <li key={product.slug}>
                <Link href={`/products/${product.slug}`} className="flex items-baseline justify-between gap-4 py-3">
                  <span className="font-serif text-xl">{product.name}</span>
                  <span className="text-sm">{product.specs[0]?.value}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line">
        <ul className="mx-auto grid max-w-6xl gap-4 px-4 py-8 text-sm sm:grid-cols-3">
          <li>
            <p className="font-medium">US warehouse</p>
            <p className="mt-1 text-ink/75">Live orders will ship from a US warehouse once a supplier is connected.</p>
          </li>
          <li>
            <p className="font-medium">Returns</p>
            <p className="mt-1 text-ink/75">Unused items can be returned within 30 days of delivery.</p>
          </li>
          <li>
            <p className="font-medium">Measured specs</p>
            <p className="mt-1 text-ink/75">Figures on these pages are placeholders until a sample is weighed.</p>
          </li>
        </ul>
      </section>
    </>
  );
}
