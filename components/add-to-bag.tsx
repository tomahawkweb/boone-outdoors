"use client";

import { useState } from "react";
import { useBag } from "@/components/bag-provider";

export function AddToBag({ slug }: { slug: string }) {
  const { add } = useBag();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  return (
    <form
      className="mt-6 flex flex-wrap items-end gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        add(slug, quantity);
        setAdded(true);
      }}
    >
      <label className="text-sm">
        Quantity
        <input
          type="number"
          min={1}
          max={9}
          value={quantity}
          onChange={(event) => {
            setAdded(false);
            setQuantity(Number(event.target.value));
          }}
          className="mt-1 block w-20 border border-line bg-paper px-3 py-2"
        />
      </label>
      <button type="submit" className="bg-pine px-5 py-2.5 text-sm text-stone hover:bg-pine-deep">
        Add to bag
      </button>
      {added ? (
        <p className="text-sm text-pine" role="status">
          Added. <a href="/bag" className="underline">View bag</a>
        </p>
      ) : null}
    </form>
  );
}
