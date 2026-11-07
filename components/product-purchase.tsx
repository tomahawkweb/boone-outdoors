"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { useBag } from "@/components/bag-provider";
import type { ProductColor, ProductImage, ProductSize } from "@/lib/catalog";

export function ProductPurchase({
  slug,
  name,
  image,
  colors,
  sizes,
  children,
}: {
  slug: string;
  name: string;
  image?: ProductImage;
  colors?: ProductColor[];
  sizes?: ProductSize[];
  children: ReactNode;
}) {
  const { add } = useBag();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState(colors?.[0]?.name ?? "");
  const [size, setSize] = useState(sizes?.find((item) => item.code === "lrg")?.code ?? sizes?.[0]?.code ?? "");
  const [added, setAdded] = useState(false);

  const selected = colors?.find((item) => item.name === color);
  const photo = selected?.image ?? image;
  const photos = (colors ?? []).filter((item) => item.image);
  const sizeLabel = sizes?.find((item) => item.code === size)?.label;

  function chooseColor(next: string) {
    setAdded(false);
    setColor(next);
  }

  return (
    <div className="mt-4 grid gap-10 md:grid-cols-[0.9fr_1.1fr]">
      <div>
        {photo ? (
          <>
            <button
              type="button"
              className="block w-full overflow-hidden bg-paper text-left"
              onClick={() => dialogRef.current?.showModal()}
            >
              <Image
                key={photo.src}
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                priority
                className="h-auto w-full"
                sizes="(min-width: 768px) 42vw, 100vw"
              />
            </button>
            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
              <p aria-live="polite">{selected?.name ?? name}</p>
              <p className="text-ink/70">Click the photo to enlarge</p>
            </div>
            <dialog
              ref={dialogRef}
              className="w-[min(100%,42rem)] bg-paper p-3 backdrop:bg-ink/70"
              onClick={(event) => {
                if (event.target === event.currentTarget) dialogRef.current?.close();
              }}
            >
              <form method="dialog" className="mb-2 flex justify-end">
                <button type="submit" className="border border-line px-3 py-1 text-sm">
                  Close
                </button>
              </form>
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                className="h-auto w-full"
              />
            </dialog>
          </>
        ) : (
          <div className="flex min-h-72 items-end bg-pine-deep p-6 text-stone">
            <p className="font-serif text-4xl leading-tight">{name}</p>
          </div>
        )}
        {photos.length > 1 ? (
          <ul className="mt-3 flex gap-2 overflow-x-auto" aria-label="Shirt colors">
            {photos.map((item) => {
              const thumb = item.image;
              if (!thumb) return null;
              const selectedThumb = item.name === color;
              return (
                <li key={item.name}>
                  <button
                    type="button"
                    aria-pressed={selectedThumb}
                    aria-label={item.name}
                    onClick={() => chooseColor(item.name)}
                    className={`w-16 overflow-hidden border bg-paper ${selectedThumb ? "border-pine" : "border-line"}`}
                  >
                    <Image src={thumb.src} alt="" width={128} height={170} className="h-auto w-full" />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
      <div>
        {children}
        <form
          className="mt-6 flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            add(slug, quantity, { color: color || undefined, size: size || undefined });
            setAdded(true);
          }}
        >
          {colors && colors.length > 0 ? (
            <fieldset>
              <legend className="text-sm">
                Color <span className="text-pine">{color}</span>
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {colors.map((item) => {
                  const selectedColor = item.name === color;
                  return (
                    <label
                      key={item.name}
                      className={`flex cursor-pointer items-center gap-2 border px-2 py-1.5 text-sm ${selectedColor ? "border-pine bg-paper" : "border-line"}`}
                    >
                      <input
                        type="radio"
                        name={`${slug}-color`}
                        value={item.name}
                        checked={selectedColor}
                        onChange={() => chooseColor(item.name)}
                        className="sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className="inline-block h-5 w-5 border border-line"
                        style={{ backgroundColor: item.hex }}
                      />
                      {item.name}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ) : null}
          {sizes && sizes.length > 0 ? (
            <fieldset>
              <legend className="text-sm">
                Size <span className="text-pine">{sizeLabel}</span>
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {sizes.map((item) => {
                  const selectedSize = item.code === size;
                  return (
                    <label
                      key={item.code}
                      className={`cursor-pointer border px-3 py-2 text-sm ${selectedSize ? "border-pine bg-paper" : "border-line"}`}
                    >
                      <input
                        type="radio"
                        name={`${slug}-size`}
                        value={item.code}
                        checked={selectedSize}
                        onChange={() => {
                          setAdded(false);
                          setSize(item.code);
                        }}
                        className="sr-only"
                      />
                      {item.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ) : null}
          <div className="flex flex-wrap items-end gap-3">
            <div className="text-sm">
              <p>Quantity</p>
              <div className="mt-1 flex border border-line bg-paper">
                <button
                  type="button"
                  className="px-3 py-2"
                  aria-label="Decrease quantity"
                  onClick={() => {
                    setAdded(false);
                    setQuantity((current) => Math.max(1, current - 1));
                  }}
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={9}
                  value={quantity}
                  aria-label="Quantity"
                  onChange={(event) => {
                    setAdded(false);
                    const next = Number(event.target.value);
                    if (Number.isInteger(next)) setQuantity(Math.min(9, Math.max(1, next)));
                  }}
                  className="w-12 border-x border-line bg-paper py-2 text-center"
                />
                <button
                  type="button"
                  className="px-3 py-2"
                  aria-label="Increase quantity"
                  onClick={() => {
                    setAdded(false);
                    setQuantity((current) => Math.min(9, current + 1));
                  }}
                >
                  +
                </button>
              </div>
            </div>
            <button type="submit" className="bg-pine px-5 py-2.5 text-sm text-stone hover:bg-pine-deep">
              Add to bag
            </button>
            {added ? (
              <p className="text-sm text-pine" role="status">
                Added {color}
                {sizeLabel ? ` / ${sizeLabel}` : ""}. <a href="/bag" className="underline">View bag</a>
              </p>
            ) : null}
          </div>
        </form>
        <p className="mt-6 text-sm text-ink/75">
          Unused items can be returned within 30 days of delivery.{" "}
          <Link href="/policies" className="text-pine underline">
            Shipping and returns
          </Link>
        </p>
      </div>
    </div>
  );
}
