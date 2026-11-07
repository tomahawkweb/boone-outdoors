"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe, type StripeElementsOptions } from "@stripe/stripe-js";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { bagLineKey, useBag } from "@/components/bag-provider";
import { productBySlug } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";

const states = [
  ["AL", "Alabama"],
  ["AK", "Alaska"],
  ["AZ", "Arizona"],
  ["AR", "Arkansas"],
  ["CA", "California"],
  ["CO", "Colorado"],
  ["CT", "Connecticut"],
  ["DE", "Delaware"],
  ["DC", "District of Columbia"],
  ["FL", "Florida"],
  ["GA", "Georgia"],
  ["HI", "Hawaii"],
  ["ID", "Idaho"],
  ["IL", "Illinois"],
  ["IN", "Indiana"],
  ["IA", "Iowa"],
  ["KS", "Kansas"],
  ["KY", "Kentucky"],
  ["LA", "Louisiana"],
  ["ME", "Maine"],
  ["MD", "Maryland"],
  ["MA", "Massachusetts"],
  ["MI", "Michigan"],
  ["MN", "Minnesota"],
  ["MS", "Mississippi"],
  ["MO", "Missouri"],
  ["MT", "Montana"],
  ["NE", "Nebraska"],
  ["NV", "Nevada"],
  ["NH", "New Hampshire"],
  ["NJ", "New Jersey"],
  ["NM", "New Mexico"],
  ["NY", "New York"],
  ["NC", "North Carolina"],
  ["ND", "North Dakota"],
  ["OH", "Ohio"],
  ["OK", "Oklahoma"],
  ["OR", "Oregon"],
  ["PA", "Pennsylvania"],
  ["RI", "Rhode Island"],
  ["SC", "South Carolina"],
  ["SD", "South Dakota"],
  ["TN", "Tennessee"],
  ["TX", "Texas"],
  ["UT", "Utah"],
  ["VT", "Vermont"],
  ["VA", "Virginia"],
  ["WA", "Washington"],
  ["WV", "West Virginia"],
  ["WI", "Wisconsin"],
  ["WY", "Wyoming"],
] as const;

const fieldClass = "mt-1 block w-full border border-line bg-paper px-3 py-2";

export function CheckoutView({ publishableKey }: { publishableKey: string }) {
  const { lines } = useBag();
  const [ready, setReady] = useState(false);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState("");

  const detailed = lines
    .map((line) => {
      const product = productBySlug(line.slug);
      return product ? { line, product } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
  const signature = detailed.map(({ line }) => `${bagLineKey(line)}:${line.quantity}`).join(",");

  useEffect(() => {
    setReady(true);
    if (!publishableKey.startsWith("pk_test_") && !publishableKey.startsWith("pk_live_")) return;
    setStripePromise(loadStripe(publishableKey));
  }, [publishableKey]);

  useEffect(() => {
    if (!ready || detailed.length === 0) return;
    const controller = new AbortController();
    setError("");
    setClientSecret("");
    fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        items: detailed.map((item) => ({
          slug: item.product.slug,
          quantity: item.line.quantity,
          color: item.line.color,
          size: item.line.size,
        })),
      }),
    })
      .then(async (response) => {
        const body = (await response.json()) as { clientSecret?: string; amount?: number; error?: string };
        if (!response.ok || !body.clientSecret || body.amount == null) {
          setError(body.error ?? "Checkout could not start.");
          return;
        }
        setClientSecret(body.clientSecret);
        setAmount(body.amount);
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError("Checkout could not start.");
      });
    return () => controller.abort();
    // The signature captures the bag contents that the payment is priced from.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, signature]);

  if (!ready) {
    return <p className="mt-8">Loading checkout…</p>;
  }

  if (!stripePromise) {
    return <p className="mt-8">Add the test publishable key to .env.local, then restart the dev server.</p>;
  }

  if (detailed.length === 0) {
    return (
      <div className="mt-8">
        <p>Your bag is empty.</p>
        <Link href="/shop" className="mt-4 inline-block text-pine underline">
          Shop all gear
        </Link>
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      variables: {
        colorPrimary: "#1e3d32",
        colorBackground: "#f7f4ee",
        colorText: "#1c1c1b",
        colorDanger: "#b85c38",
        fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif",
        borderRadius: "0px",
      },
    },
  };

  return (
    <div className="mt-8 grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
      <div>
        {error ? (
          <p className="text-sm" role="alert">
            {error}
          </p>
        ) : null}
        {clientSecret ? (
          <Elements stripe={stripePromise} options={options}>
            <PaymentForm amount={amount} />
          </Elements>
        ) : error ? null : (
          <p>Preparing payment…</p>
        )}
      </div>
      <aside>
        <h2 className="font-serif text-3xl">Your order</h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {detailed.map(({ line, product }) => (
            <li key={bagLineKey(line)} className="py-3">
              <p>{product.name}</p>
              <p className="text-sm">
                {[line.color, product.sizes?.find((item) => item.code === line.size)?.label, `Qty ${line.quantity}`]
                  .filter(Boolean)
                  .join(" / ")}
              </p>
              <p className="text-sm">{formatMoney(product.priceCents * line.quantity)}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-lg">Total {formatMoney(amount || detailed.reduce((sum, item) => sum + item.product.priceCents * item.line.quantity, 0))}</p>
      </aside>
    </div>
  );
}

function PaymentForm({ amount }: { amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("KY");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");

  async function pay(event: FormEvent) {
    event.preventDefault();
    if (!stripe || !elements) return;
    setPending(true);
    setError("");
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
        receipt_email: email.trim(),
        shipping: {
          name: name.trim(),
          phone: phone.trim(),
          address: {
            line1: line1.trim(),
            city: city.trim(),
            state,
            postal_code: zip.trim(),
            country: "US",
          },
        },
      },
    });
    if (result.error) {
      setError(result.error.message ?? "The payment did not go through.");
      setPending(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={pay}>
      <fieldset className="grid gap-3">
        <legend className="font-serif text-3xl">Ship to</legend>
        <label className="text-sm">
          Email
          <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} />
        </label>
        <label className="text-sm">
          Full name
          <input required value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} />
        </label>
        <label className="text-sm">
          Address
          <input required value={line1} onChange={(event) => setLine1(event.target.value)} className={fieldClass} />
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            City
            <input required value={city} onChange={(event) => setCity(event.target.value)} className={fieldClass} />
          </label>
          <label className="text-sm">
            State
            <select required value={state} onChange={(event) => setState(event.target.value)} className={fieldClass}>
              {states.map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            ZIP
            <input required inputMode="numeric" pattern="[0-9]{5}" value={zip} onChange={(event) => setZip(event.target.value)} className={fieldClass} />
          </label>
        </div>
        <label className="text-sm">
          Phone
          <input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className={fieldClass} />
        </label>
      </fieldset>
      <fieldset>
        <legend className="font-serif text-3xl">Payment</legend>
        <div className="mt-3">
          <PaymentElement />
        </div>
      </fieldset>
      {error ? (
        <p className="text-sm" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={!stripe || pending} className="bg-pine px-5 py-3 text-sm text-stone disabled:opacity-60">
        {pending ? "Paying…" : `Pay ${formatMoney(amount)}`}
      </button>
    </form>
  );
}
