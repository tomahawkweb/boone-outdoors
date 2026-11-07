import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Daniel Boone Outdoors is an independent shop for packs, camp kit, and carry.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-serif text-5xl tracking-tight">About</h1>
      <div className="mt-6 space-y-4 text-lg">
        <p>
          Daniel Boone Outdoors is a small shop for packs, camp kit, fishing bait, and clothes you can wear outside.
        </p>
        <p>
          The assortment stays short on purpose. Trending pieces stay up while they earn a place. The rest are
          the things worth keeping in the kit.
        </p>
        <p>We do not sell weapons, body armor, or tactical pens.</p>
      </div>
    </div>
  );
}
