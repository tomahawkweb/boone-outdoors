import type Stripe from "stripe";
import { productBySlug } from "@/lib/catalog";
import { designIdFor, printBlanks } from "@/lib/print-blanks";
import {
  createQuote,
  placeOrder,
  scalablePressKeyMode,
  type PrintAddress,
  type QuoteResult,
} from "@/lib/scalable-press";
import { stripeClient } from "@/lib/stripe";

export type FulfillmentStatus = "placed" | "held" | "skipped" | "blocked" | "failed" | "unpaid" | "placing";

export type FulfillmentResult = {
  status: FulfillmentStatus;
  orderId?: string;
  mode?: string;
  detail: string;
  already?: boolean;
};

const inflight = new Map<string, Promise<FulfillmentResult>>();

export function fulfillPaymentIntent(paymentIntentId: string) {
  const existing = inflight.get(paymentIntentId);
  if (existing) return existing;
  const run = fulfillOnce(paymentIntentId).finally(() => {
    inflight.delete(paymentIntentId);
  });
  inflight.set(paymentIntentId, run);
  return run;
}

async function fulfillOnce(paymentIntentId: string): Promise<FulfillmentResult> {
  const stripe = stripeClient();
  if ("error" in stripe) return { status: "failed", detail: stripe.error };

  const intent = await stripe.client.paymentIntents.retrieve(paymentIntentId);
  if (intent.status !== "succeeded") {
    return { status: "unpaid", detail: "The payment is not complete." };
  }

  const existingId = intent.metadata.sp_order_id?.trim();
  if (existingId) {
    return {
      status: "placed",
      orderId: existingId,
      mode: intent.metadata.sp_mode,
      detail: "This payment already has a print order.",
      already: true,
    };
  }

  if (intent.metadata.sp_status === "held" || intent.metadata.sp_status === "skipped") {
    return {
      status: intent.metadata.sp_status,
      detail: intent.metadata.sp_detail || "This payment was already reviewed.",
      already: true,
    };
  }

  if (intent.metadata.sp_status === "placing") {
    const started = Number(intent.metadata.sp_started || 0);
    if (Number.isFinite(started) && Date.now() - started < 120_000) {
      return { status: "placing", detail: "The print order is being sent." };
    }
  }

  const keyMode = scalablePressKeyMode();
  if (keyMode !== "test" && process.env.SCALABLEPRESS_ALLOW_LIVE !== "1") {
    return {
      status: "blocked",
      detail:
        keyMode === "live"
          ? "Add the Scalable Press test key as SCALABLEPRESS_TEST_API_KEY. The live key can stay in the file."
          : "Add the Scalable Press test key before sending a print order.",
    };
  }

  const lines = orderLines(intent);
  if ("error" in lines) return lines.error;
  if (lines.expectedCents !== intent.amount) {
    return remember(stripe.client, intent.id, {
      status: "held",
      detail: "The payment amount does not match the catalog.",
    });
  }

  const address = shipAddress(intent);
  if ("error" in address) return remember(stripe.client, intent.id, address.error);
  if (lines.printable.length === 0) {
    return remember(stripe.client, intent.id, {
      status: "skipped",
      detail: "Nothing in this order is set up to print.",
    });
  }

  await stripe.client.paymentIntents.update(intent.id, {
    metadata: { sp_status: "placing", sp_started: String(Date.now()), sp_detail: "Sending the print order." },
  });

  try {
    const orderIds: string[] = [];
    let mode = "";
    const groups = new Map<string, typeof lines.printable>();
    for (const line of lines.printable) {
      const key = `${line.printType}:${line.designId}:${line.productId}`;
      const group = groups.get(key) ?? [];
      group.push(line);
      groups.set(key, group);
    }

    for (const group of groups.values()) {
      const first = group[0];
      const quote = await createQuote({
        name: intent.id,
        printType: first.printType,
        productId: first.productId,
        color: first.color,
        size: first.size,
        quantity: first.quantity,
        designId: first.designId,
        products: group.map((line) => ({
          id: line.productId,
          color: line.color,
          size: line.size,
          quantity: line.quantity,
        })),
        address: address.value,
      });

      if (quote.mode === "live" && process.env.SCALABLEPRESS_ALLOW_LIVE !== "1") {
        return remember(stripe.client, intent.id, {
          status: "blocked",
          detail: "The quote came back as a live order, so it was not placed.",
        });
      }

      const problems = issueText(quote);
      if (problems || !quote.orderToken) {
        return remember(stripe.client, intent.id, {
          status: "failed",
          detail: problems || "Scalable Press did not return an order token.",
        });
      }

      const sellCents = group.reduce((sum, line) => sum + line.sellCents, 0);
      const costCents = landedCents(quote);
      const ceilingCents = Math.round(sellCents * 0.3);
      if (costCents > ceilingCents) {
        return remember(stripe.client, intent.id, {
          status: "held",
          detail: `Print cost is ${(costCents / 100).toFixed(2)}, above the ${(ceilingCents / 100).toFixed(2)} ceiling.`,
        });
      }

      const order = await placeOrder(quote.orderToken);
      if (!order.orderId) {
        return remember(stripe.client, intent.id, {
          status: "failed",
          detail: "Scalable Press accepted the request without an order id.",
        });
      }
      if (order.mode === "live" && process.env.SCALABLEPRESS_ALLOW_LIVE !== "1") {
        return remember(stripe.client, intent.id, {
          status: "held",
          orderId: order.orderId,
          mode: order.mode,
          detail: "A live print order was returned. Check the Scalable Press account.",
        });
      }
      orderIds.push(order.orderId);
      mode = order.mode || mode;
    }

    return remember(stripe.client, intent.id, {
      status: "placed",
      orderId: orderIds.join(","),
      mode,
      detail: "Scalable Press accepted the order.",
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "The print order failed.";
    return remember(stripe.client, intent.id, { status: "failed", detail });
  }
}

type PrintLine = {
  printType: "dtg" | "embr";
  productId: string;
  designId: string;
  color: string;
  size: string;
  quantity: number;
  sellCents: number;
};

function orderLines(intent: Stripe.PaymentIntent): { printable: PrintLine[]; expectedCents: number } | { error: FulfillmentResult } {
  const raw = intent.metadata.items?.trim();
  if (!raw) {
    return { error: { status: "held", detail: "This payment has no items to print." } };
  }

  const printable: PrintLine[] = [];
  let expectedCents = 0;

  for (const part of raw.split(",")) {
    const [slug, quantityText, color = "", size = ""] = part.split("|");
    const product = slug ? productBySlug(slug) : undefined;
    const quantity = Number(quantityText);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 9) {
      return { error: { status: "held", detail: "This payment has an item the catalog does not recognize." } };
    }
    if (product.colors && !product.colors.some((option) => option.name === color)) {
      return { error: { status: "held", detail: "This payment has a color the catalog does not recognize." } };
    }
    if (product.sizes && !product.sizes.some((option) => option.code === size)) {
      return { error: { status: "held", detail: "This payment has a size the catalog does not recognize." } };
    }
    expectedCents += product.priceCents * quantity;

    const blank = printBlanks.find((item) => item.slug === product.slug);
    const designId = blank ? designIdFor(blank) : undefined;
    if (!blank || !designId) continue;
    printable.push({
      printType: blank.printType,
      productId: blank.productId,
      designId,
      color,
      size,
      quantity,
      sellCents: product.priceCents * quantity,
    });
  }

  return { printable, expectedCents };
}

function shipAddress(intent: Stripe.PaymentIntent): { value: PrintAddress } | { error: FulfillmentResult } {
  const shipping = intent.shipping;
  const address = shipping?.address;
  if (!shipping?.name || !address?.line1 || !address.city || !address.state || !address.postal_code) {
    return { error: { status: "held", detail: "The payment is missing a shipping address." } };
  }
  if (address.country && address.country !== "US") {
    return { error: { status: "held", detail: "Print orders ship inside the US." } };
  }
  return {
    value: {
      name: shipping.name,
      address1: address.line1,
      ...(address.line2 ? { address2: address.line2 } : {}),
      city: address.city,
      state: address.state,
      zip: address.postal_code,
      country: "US",
      ...(intent.receipt_email ? { email: intent.receipt_email } : {}),
    },
  };
}

function issueText(quote: QuoteResult) {
  return [...(quote.issues ?? []), ...(quote.orderIssues ?? [])]
    .map((issue) => issue.message)
    .filter((message): message is string => Boolean(message))
    .join(" ");
}

function landedCents(quote: QuoteResult) {
  if (quote.subtotal == null && quote.shipping == null) return Math.round((quote.total ?? 0) * 100);
  return Math.round(((quote.subtotal ?? 0) + (quote.shipping ?? 0) + (quote.fees ?? 0)) * 100);
}

async function remember(
  client: Stripe,
  paymentIntentId: string,
  result: FulfillmentResult,
): Promise<FulfillmentResult> {
  const detail = result.detail.slice(0, 450);
  await client.paymentIntents.update(paymentIntentId, {
    metadata: {
      sp_status: result.status,
      sp_detail: detail,
      ...(result.orderId ? { sp_order_id: result.orderId } : {}),
      ...(result.mode ? { sp_mode: result.mode } : {}),
    },
  });
  return { ...result, detail };
}
