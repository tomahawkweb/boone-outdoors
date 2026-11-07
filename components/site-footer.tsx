import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm sm:grid-cols-3">
        <div>
          <p className="font-serif text-xl">Daniel Boone Outdoors</p>
          <p className="mt-2 max-w-xs text-ink/80">Gear for the day ahead. Packs, camp kit, fishing, and wear.</p>
        </div>
        <nav aria-label="Shop">
          <p className="text-xs uppercase tracking-[0.16em] text-pine">Shop</p>
          <ul className="mt-3 space-y-2">
            <li><Link href="/shop">Shop all</Link></li>
            <li><Link href="/trending">Trending</Link></li>
            <li><Link href="/packs-and-bags">Packs & Bags</Link></li>
            <li><Link href="/camp-and-hike">Camp & Hike</Link></li>
            <li><Link href="/carry">Carry</Link></li>
            <li><Link href="/fishing">Fishing</Link></li>
            <li><Link href="/wear">Wear</Link></li>
          </ul>
        </nav>
        <nav aria-label="About">
          <p className="text-xs uppercase tracking-[0.16em] text-pine">About</p>
          <ul className="mt-3 space-y-2">
            <li><Link href="/guides">Guides</Link></li>
            <li><Link href="/policies">Shipping and returns</Link></li>
            <li><Link href="/about">About</Link></li>
          </ul>
        </nav>
      </div>
      <p className="mx-auto max-w-6xl px-4 pb-8 text-sm text-ink/70">
        The products on this site are a sample assortment so the shop can be built. Specs are supplier-sheet
        placeholders. Measured figures and live shipping replace them before the store opens.
      </p>
    </footer>
  );
}
