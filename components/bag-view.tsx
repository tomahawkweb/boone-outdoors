"use client";

import Link from "next/link";
import { useState } from "react";
import { bagLineKey, useBag } from "@/components/bag-provider";
import { productBySlug } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";

export function BagView() {
  const { lines, setQuantity, remove } = useBag();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const detailed = lines
    .map((line) => {
      const product = productBySlug(line.slug);
      return product ? { line, product } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const total = detailed.reduce((sum, item) => sum + item.product.priceCents * item.line.quantity, 0);

  async function checkout() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: detailed.map((item) => ({
            slug: item.product.slug,
            quantity: item.line.quantity,
            color: item.line.color,
            size: item.line.size,
          })),
        }),
      });
      const body = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !body.url) {
        setError(body.error ?? "Checkout could not start.");
        setPending(false);
        return;
      }
      window.location.assign(body.url);
    } catch {
      setError("Checkout could not start.");
      setPending(false);
    }
  }

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
      <button
        type="button"
        onClick={checkout}
        disabled={pending}
        className="mt-4 bg-pine px-5 py-3 text-sm text-stone disabled:opacity-60"
      >
        {pending ? "Opening Stripe…" : "Checkout with Stripe"}
      </button>
      {error ? (
        <p className="mt-3 max-w-lg text-sm" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
