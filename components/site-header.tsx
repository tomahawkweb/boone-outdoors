import Image from "next/image";
import Link from "next/link";
import { primaryNav } from "@/lib/nav";
import { BagLink } from "@/components/bag-link";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-stone">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-20 focus:bg-paper focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 md:gap-8">
        <Link href="/" className="shrink-0">
          <Image
            src="/logo-wordmark.png"
            alt="Daniel Boone Outdoors"
            width={776}
            height={255}
            priority
            unoptimized
            className="h-12 w-auto sm:h-14"
          />
        </Link>
        <nav className="hidden items-center gap-4 text-sm lg:flex" aria-label="Primary">
          {primaryNav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-pine">
              {item.label}
            </Link>
          ))}
        </nav>
        <form action="/search" className="ml-auto flex min-w-0 flex-1 justify-end md:max-w-xs" role="search">
          <label htmlFor="site-search" className="sr-only">
            Search gear
          </label>
          <input
            id="site-search"
            name="q"
            type="search"
            placeholder="Search gear"
            className="w-full border border-line bg-paper px-3 py-2 text-sm"
          />
        </form>
        <BagLink />
      </div>
      <nav className="flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden" aria-label="Primary">
        {primaryNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-full border border-line bg-paper px-3 py-1.5 text-sm"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
