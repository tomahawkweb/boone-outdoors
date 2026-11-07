import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ClearBag } from "@/components/clear-bag";
import { PrintHandoff } from "@/components/print-handoff";
import { formatMoney } from "@/lib/format";
import { stripeClient } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_intent?: string; redirect_status?: string }>;
}) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-xl px-4 py-10">Checking the payment…</p>}>
      <ConfirmedOrder searchParams={searchParams} />
    </Suspense>
  );
}

async function ConfirmedOrder({
  searchParams,
}: {
  searchParams: Promise<{ payment_intent?: string; redirect_status?: string }>;
}) {
  const { payment_intent: paymentIntentId, redirect_status: redirectStatus } = await searchParams;
  const stripe = stripeClient();
  const intent =
    paymentIntentId && !("error" in stripe) ? await stripe.client.paymentIntents.retrieve(paymentIntentId) : null;
  const paid = intent?.status === "succeeded" && redirectStatus !== "failed";

  if (!paid) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <h1 className="font-serif text-5xl tracking-tight">Payment not confirmed</h1>
        <p className="mt-4 text-lg">
          {paymentIntentId && stripe && "error" in stripe
            ? stripe.error
            : "This page opens after a payment on the checkout page."}
        </p>
        <Link href="/bag" className="mt-6 inline-block text-pine underline">
          Back to the bag
        </Link>
      </div>
    );
  }

  const ship = intent.shipping;
  const place = [ship?.address?.city, ship?.address?.state].filter(Boolean).join(", ");

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <ClearBag />
      <h1 className="font-serif text-5xl tracking-tight">Order received</h1>
      <p className="mt-4 text-lg">The payment of {formatMoney(intent.amount)} is complete.</p>
      <PrintHandoff paymentIntentId={intent.id} />
      {intent.receipt_email ? <p className="mt-4">A receipt goes to {intent.receipt_email}.</p> : null}
      {ship?.name ? (
        <p className="mt-2">
          Ship to {ship.name}
          {place ? `, ${place}` : ""}.
        </p>
      ) : null}
      <Link href="/shop" className="mt-6 inline-block text-pine underline">
        Back to the shop
      </Link>
    </div>
  );
}
