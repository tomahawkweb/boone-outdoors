import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { departmentById, productsInDepartment, type DepartmentId, type ProductUse } from "@/lib/catalog";

type UseFilter = ProductUse | "field";

export function CatalogList({
  department,
  title,
  intro,
  maxCents,
  use,
}: {
  department?: DepartmentId;
  title: string;
  intro: string;
  maxCents?: number;
  use?: UseFilter;
}) {
  const items = department
    ? productsInDepartment(department, { maxCents, use })
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-5xl tracking-tight">{title}</h1>
      <p className="mt-3 max-w-xl text-lg text-ink/80">{intro}</p>
      {department ? (
        <div className="mt-6 flex flex-wrap gap-2 text-sm">
          <FilterLink href={departmentById(department).path} current={!maxCents && !use}>
            All
          </FilterLink>
          <FilterLink href={`${departmentById(department).path}?max=4000`} current={maxCents === 4000}>
            Under $40
          </FilterLink>
          {department === "camp-and-hike" ? (
            <FilterLink href="/camp-and-hike?use=field" current={use === "field"}>
              Light & water
            </FilterLink>
          ) : null}
          {department === "fishing" ? (
            <>
              <FilterLink href="/fishing?use=bait" current={use === "bait"}>
                Bait
              </FilterLink>
              <FilterLink href="/fishing?use=apparel" current={use === "apparel"}>
                Hats & shirts
              </FilterLink>
            </>
          ) : null}
          {department === "wear" ? (
            <>
              <FilterLink href="/wear?use=apparel" current={use === "apparel"}>
                Hats & shirts
              </FilterLink>
              <FilterLink href="/wear?use=bracelet" current={use === "bracelet"}>
                Bracelets
              </FilterLink>
            </>
          ) : null}
        </div>
      ) : null}
      {items.length === 0 ? (
        <p className="mt-8">Nothing in this view yet.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterLink({ href, current, children }: { href: string; current: boolean; children: string }) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={`border px-3 py-1.5 ${current ? "border-pine bg-pine text-stone" : "border-line bg-paper"}`}
    >
      {children}
    </Link>
  );
}
