const API_URL = "https://api.scalablepress.com/v2";

export type PrintType = "dtg" | "embr";

export type QuoteRequest = {
  name: string;
  printType: PrintType;
  productId: string;
  color: string;
  size: string;
  quantity: number;
  designId?: string;
};

export type QuoteIssue = {
  code?: string;
  path?: string;
  message?: string;
};

export type QuoteResult = {
  total?: number;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  fees?: number;
  mode?: string;
  orderToken?: string;
  warnings?: string[];
  issues?: QuoteIssue[];
  orderIssues?: QuoteIssue[];
};

export class ScalablePressError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export function scalablePressKey() {
  const key = process.env.SCALABLEPRESS_API_KEY?.trim();
  if (!key || key === "test_replace_me") {
    throw new Error(
      "Add SCALABLEPRESS_API_KEY to .env.local. Use the test key from the Scalable Press account. It starts with test_.",
    );
  }
  if (key.startsWith("live_") && process.env.SCALABLEPRESS_ALLOW_LIVE !== "1") {
    throw new Error("That key starts with live_. Put the test_ key in .env.local for a price check.");
  }
  return key;
}

function quoteAddress() {
  return {
    name: "Daniel Boone Outdoors",
    address1: "1 Main St",
    city: process.env.SCALABLEPRESS_QUOTE_CITY?.trim() || "Lexington",
    state: process.env.SCALABLEPRESS_QUOTE_STATE?.trim() || "KY",
    zip: process.env.SCALABLEPRESS_QUOTE_ZIP?.trim() || "40507",
    country: "US",
  };
}

export async function createQuote(request: QuoteRequest): Promise<QuoteResult> {
  const key = scalablePressKey();
  const designId = request.designId?.trim();
  const response = await fetch(`${API_URL}/quote`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`:${key}`).toString("base64")}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: request.printType,
      name: request.name,
      ...(designId ? { designId } : { sides: { front: 1 } }),
      products: [
        {
          id: request.productId,
          color: request.color,
          size: request.size,
          quantity: request.quantity,
        },
      ],
      address: quoteAddress(),
    }),
  });

  const body = (await response.json().catch(() => null)) as QuoteResult | { message?: string } | null;
  if (!response.ok) {
    const message =
      body && "message" in body && body.message
        ? body.message
        : `Scalable Press returned ${response.status}.`;
    throw new ScalablePressError(message, response.status, body);
  }

  return (body ?? {}) as QuoteResult;
}
