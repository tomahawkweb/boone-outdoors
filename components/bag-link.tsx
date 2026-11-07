"use client";

import Link from "next/link";
import { useBag } from "@/components/bag-provider";

export function BagLink() {
  const { count } = useBag();
  const shown = count;

  return (
    <Link href="/bag" className="shrink-0 text-sm" aria-label={`Bag, ${shown} ${shown === 1 ? "item" : "items"}`}>
      Bag
      <span className="ml-1 tabular-nums text-pine">({shown})</span>
    </Link>
  );
}
