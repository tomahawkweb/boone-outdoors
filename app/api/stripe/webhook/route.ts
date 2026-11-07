import { fulfillPaymentIntent } from "@/lib/fulfillment";
import { stripeClient } from "@/lib/stripe";

export async function POST(request: Request) {
  const stripe = stripeClient();
  if ("error" in stripe) {
    return Response.json({ error: stripe.error }, { status: stripe.status });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";
  if (!secret || secret.includes("replace_me")) {
    return Response.json(
      { error: "Add STRIPE_WEBHOOK_SECRET from stripe listen or the Stripe webhook endpoint." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const payload = await request.text();
  let event;
  try {
    event = stripe.client.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return Response.json({ error: "Stripe signature did not match." }, { status: 400 });
  }

  if (event.type !== "payment_intent.succeeded") {
    return Response.json({ received: true });
  }

  const result = await fulfillPaymentIntent(event.data.object.id);
  return Response.json(result, { status: result.status === "failed" ? 500 : 200 });
}
