import type { Metadata } from "next";
import Link from "next/link";
import { ClearBag } from "@/components/clear-bag";

export const metadata: Metadata = {
  title: "Order received",
};

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <ClearBag />
      <h1 className="font-serif text-5xl tracking-tight">Order received</h1>
      <p className="mt-4 text-lg">
        Stripe has the payment. A shipping note will follow once a supplier is fulfilling live orders.
      </p>
      <Link href="/shop" className="mt-6 inline-block text-pine underline">
        Back to the shop
      </Link>
    </div>
  );
}
