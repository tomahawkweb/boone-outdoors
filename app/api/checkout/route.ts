import { productBySlug } from "@/lib/catalog";
import Stripe from "stripe";

type CheckoutItem = { slug?: string; quantity?: number; color?: string; size?: string };

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return Response.json(
      { error: "Stripe is not configured yet. Add STRIPE_SECRET_KEY to the environment." },
      { status: 503 },
    );
  }

  let items: CheckoutItem[] = [];
  try {
    const body = (await request.json()) as { items?: CheckoutItem[] };
    items = Array.isArray(body.items) ? body.items : [];
  } catch {
    return Response.json({ error: "The bag could not be read." }, { status: 400 });
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  for (const item of items) {
    if (!item.slug) continue;
    const product = productBySlug(item.slug);
    const quantity = Number(item.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 9) {
      return Response.json({ error: "A bag item is not in the catalog." }, { status: 400 });
    }
    const color = item.color?.trim();
    const size = item.size?.trim();
    if (product.colors && !product.colors.some((option) => option.name === color)) {
      return Response.json({ error: "Choose a color from the list." }, { status: 400 });
    }
    if (product.sizes && !product.sizes.some((option) => option.code === size)) {
      return Response.json({ error: "Choose a size from the list." }, { status: 400 });
    }
    const sizeLabel = product.sizes?.find((option) => option.code === size)?.label;
    const variant = [color, sizeLabel].filter(Boolean).join(" / ");
    lineItems.push({
      quantity,
      price_data: {
        currency: "usd",
        unit_amount: product.priceCents,
        product_data: {
          name: variant ? `${product.name} — ${variant}` : product.name,
          description: product.summary,
        },
      },
    });
  }

  if (lineItems.length === 0) {
    return Response.json({ error: "Your bag is empty." }, { status: 400 });
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const stripe = new Stripe(secret);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/bag`,
  });

  if (!session.url) {
    return Response.json({ error: "Stripe did not return a checkout link." }, { status: 502 });
  }

  return Response.json({ url: session.url });
}
