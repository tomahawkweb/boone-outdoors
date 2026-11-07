import { productBySlug } from "@/lib/catalog";
import { stripeClient } from "@/lib/stripe";

type CheckoutItem = { slug?: string; quantity?: number; color?: string; size?: string };

function itemsMetadata(items: CheckoutItem[]) {
  const parts = items
    .filter((item) => item.slug)
    .map((item) => [item.slug, item.quantity, item.color ?? "", item.size ?? ""].join("|"));
  let value = parts.join(",");
  while (value.length > 500 && parts.length > 1) {
    parts.pop();
    value = parts.join(",");
  }
  return value.length > 0 && value.length <= 500 ? value : undefined;
}

export async function POST(request: Request) {
  const stripe = stripeClient();
  if ("error" in stripe) {
    return Response.json({ error: stripe.error }, { status: stripe.status });
  }

  let items: CheckoutItem[] = [];
  try {
    const body = (await request.json()) as { items?: CheckoutItem[] };
    items = Array.isArray(body.items) ? body.items : [];
  } catch {
    return Response.json({ error: "The bag could not be read." }, { status: 400 });
  }

  const names: string[] = [];
  let amount = 0;
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
    names.push(variant ? `${product.name} — ${variant}` : product.name);
    amount += product.priceCents * quantity;
  }

  if (amount < 1) {
    return Response.json({ error: "Your bag is empty." }, { status: 400 });
  }

  const metadata = itemsMetadata(items);
  const intent = await stripe.client.paymentIntents.create({
    amount,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    description: names.join(", ").slice(0, 1000),
    ...(metadata ? { metadata: { items: metadata } } : {}),
  });

  if (!intent.client_secret) {
    return Response.json({ error: "Stripe did not start the payment." }, { status: 502 });
  }

  return Response.json({ clientSecret: intent.client_secret, amount });
}
