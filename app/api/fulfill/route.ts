import { fulfillPaymentIntent } from "@/lib/fulfillment";

export async function POST(request: Request) {
  let paymentIntentId = "";
  try {
    const body = (await request.json()) as { paymentIntentId?: string };
    paymentIntentId = body.paymentIntentId?.trim() ?? "";
  } catch {
    return Response.json({ status: "failed", detail: "The payment id could not be read." }, { status: 400 });
  }

  if (!paymentIntentId.startsWith("pi_")) {
    return Response.json({ status: "failed", detail: "That payment id is not valid." }, { status: 400 });
  }

  const result = await fulfillPaymentIntent(paymentIntentId);
  return Response.json(result, { status: result.status === "failed" ? 502 : 200 });
}
