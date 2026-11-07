import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutView } from "@/components/checkout-view";
import { stripePublishableKey } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Shipping and payment for your bag.",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-serif text-5xl tracking-tight">Checkout</h1>
      <Suspense fallback={<p className="mt-8">Loading checkout…</p>}>
        <CheckoutView publishableKey={stripePublishableKey()} />
      </Suspense>
    </div>
  );
}
