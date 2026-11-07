import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-serif text-5xl tracking-tight">That page is not in the shop.</h1>
      <Link href="/shop" className="mt-6 inline-block text-pine underline">
        Shop all gear
      </Link>
    </div>
  );
}
