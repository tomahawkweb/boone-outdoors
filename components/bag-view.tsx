"use client";

import Link from "next/link";
import { bagLineKey, useBag } from "@/components/bag-provider";
import { productBySlug } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";

export function BagView() {
  const { lines, setQuantity, remove } = useBag();

  const detailed = lines
    .map((line) => {
      const product = productBySlug(line.slug);
      return product ? { line, product } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const total = detailed.reduce((sum, item) => sum + item.product.priceCents * item.line.quantity, 0);

  if (detailed.length === 0) {
    return (
      <div>
        <p>Your bag is empty.</p>
        <Link href="/shop" className="mt-4 inline-block text-pine underline">
          Shop all gear
        </Link>
      </div>
    );
  }

  return (
    <div>
      <ul className="divide-y divide-line border-y border-line">
        {detailed.map(({ line, product }) => (
          <li key={bagLineKey(line)} className="flex flex-wrap items-center gap-4 py-4">
            <div className="min-w-0 flex-1">
              <Link href={`/products/${product.slug}`} className="font-serif text-2xl">
                {product.name}
              </Link>
              <p className="text-sm">
                {[line.color, product.sizes?.find((item) => item.code === line.size)?.label]
                  .filter(Boolean)
                  .join(" / ")}
              </p>
              <p className="text-sm">{formatMoney(product.priceCents)}</p>
            </div>
            <label className="text-sm">
              Quantity
              <input
                type="number"
                min={1}
                max={9}
                value={line.quantity}
                onChange={(event) => setQuantity(bagLineKey(line), Number(event.target.value))}
                className="ml-2 w-16 border border-line bg-paper px-2 py-1"
              />
            </label>
            <button type="button" onClick={() => remove(bagLineKey(line))} className="text-sm underline">
              Remove
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-lg">Total {formatMoney(total)}</p>
      <Link href="/checkout" className="mt-4 inline-block bg-pine px-5 py-3 text-sm text-stone">
        Checkout
      </Link>
    </div>
  );
}
