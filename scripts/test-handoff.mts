import { readFileSync } from "node:fs";
import { scalablePressKeyMode } from "../lib/scalable-press.ts";
import { stripeClient } from "../lib/stripe.ts";

function loadEnv(path: string) {
  let text = "";
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return;
  }

  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnv(".env.local");

const mode = scalablePressKeyMode();
if (mode !== "test") {
  console.log("Handoff test stopped before Scalable Press.");
  console.log(
    mode === "live"
      ? "A live Scalable Press key is in .env.local, and the test key is not. This test places an order, and a live order is charged and printed."
      : "The Scalable Press test key is missing.",
  );
  console.log("Add SCALABLEPRESS_TEST_API_KEY to .env.local. The live key can stay. Restart the shop, then run this again.");
  console.log("No order was sent.");
  process.exit(2);
}

const stripe = stripeClient();
if ("error" in stripe) {
  console.log(stripe.error);
  process.exit(1);
}

const intent = await stripe.client.paymentIntents.create({
  amount: 4400,
  currency: "usd",
  payment_method: "pm_card_visa",
  confirm: true,
  automatic_payment_methods: { enabled: true, allow_redirects: "never" },
  receipt_email: "checkout-test@example.com",
  description: "Trail Shirt — Black / L",
  shipping: {
    name: "Test Buyer",
    phone: "8595550100",
    address: {
      line1: "1 Main St",
      city: "Lexington",
      state: "KY",
      postal_code: "40507",
      country: "US",
    },
  },
  metadata: { items: "trail-shirt|1|Black|lrg" },
});

const origin = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

async function handoff(paymentIntentId: string) {
  const response = await fetch(`${origin}/api/fulfill`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentIntentId }),
  });
  const body = (await response.json()) as {
    status?: string;
    orderId?: string;
    mode?: string;
    detail?: string;
    already?: boolean;
  };
  return { http: response.status, ...body };
}

let first;
let second;
try {
  first = await handoff(intent.id);
  second = await handoff(intent.id);
} catch {
  console.log(`The shop did not answer at ${origin}. Start it with npm run dev, then run this again.`);
  console.log(`The test payment is ${intent.id}. No print order was sent.`);
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      paymentIntent: intent.id,
      first,
      second,
    },
    null,
    2,
  ),
);

const passed =
  first.status === "placed" &&
  first.mode === "test" &&
  Boolean(first.orderId) &&
  second.already === true &&
  second.orderId === first.orderId;

if (!passed) process.exit(1);
