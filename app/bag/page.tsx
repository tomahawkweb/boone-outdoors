import type { Metadata } from "next";
import { BagView } from "@/components/bag-view";

export const metadata: Metadata = {
  title: "Bag",
  description: "Review your bag and check out with Stripe.",
};

export default function BagPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-5xl tracking-tight">Your bag</h1>
      <div className="mt-8">
        <BagView />
      </div>
    </div>
  );
}
