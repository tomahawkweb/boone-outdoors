import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping and returns",
  description: "How Daniel Boone Outdoors will ship and accept returns.",
};

export default function PoliciesPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-serif text-5xl tracking-tight">Shipping and returns</h1>
      <div className="mt-6 space-y-4">
        <p>
          Live orders will ship from a US warehouse. Transit time is stated on the product once a supplier is
          connected and a test parcel has arrived.
        </p>
        <p>
          Unused items in original condition can be returned within 30 days of delivery. You contact us, and we
          send the return steps. The sample products on the site cannot be purchased as finished goods until
          checkout is connected to a supplier.
        </p>
        <p>Stripe processes card payments. Card numbers stay with Stripe.</p>
      </div>
    </div>
  );
}
