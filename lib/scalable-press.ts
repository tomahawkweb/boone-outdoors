const API_URL = "https://api.scalablepress.com/v2";

export type PrintType = "dtg" | "embr";

export type PrintAddress = {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  email?: string;
};

export type QuoteProduct = {
  id: string;
  color: string;
  size: string;
  quantity: number;
};

export type QuoteRequest = {
  name: string;
  printType: PrintType;
  productId: string;
  color: string;
  size: string;
  quantity: number;
  designId?: string;
  products?: QuoteProduct[];
  address?: PrintAddress;
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

export type PrintOrder = {
  orderId?: string;
  status?: string;
  mode?: string;
  total?: number;
  orderToken?: string;
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

function envValue(name: string) {
  const value = process.env[name]?.trim() ?? "";
  if (!value || value.includes("replace_me")) return "";
  return value;
}

function matchingKey(prefix: string, names: string[]) {
  for (const name of names) {
    const value = envValue(name);
    if (value.startsWith(prefix)) return value;
  }
  return "";
}

function scalablePressTestKey() {
  return matchingKey("test_", ["SCALABLEPRESS_TEST_API_KEY", "SCALABLEPRESS_API_KEY"]);
}

function scalablePressLiveKey() {
  return matchingKey("live_", ["SCALABLEPRESS_LIVE_API_KEY", "SCALABLEPRESS_API_KEY"]);
}

export function scalablePressKeyMode(): "test" | "live" | "missing" {
  if (process.env.SCALABLEPRESS_ALLOW_LIVE === "1" && scalablePressLiveKey()) return "live";
  if (scalablePressTestKey()) return "test";
  if (scalablePressLiveKey()) return "live";
  return "missing";
}

export function scalablePressKey() {
  if (process.env.SCALABLEPRESS_ALLOW_LIVE === "1" && scalablePressLiveKey()) return scalablePressLiveKey();
  if (scalablePressTestKey()) return scalablePressTestKey();
  if (scalablePressLiveKey()) {
    throw new Error(
      "The live Scalable Press key can stay in .env.local. Add the test key as SCALABLEPRESS_TEST_API_KEY.",
    );
  }
  throw new Error(
    "Add SCALABLEPRESS_TEST_API_KEY to .env.local. Use the test key from the Scalable Press account. It starts with test_.",
  );
}

function authHeaders(key: string) {
  return {
    Authorization: `Basic ${Buffer.from(`:${key}`).toString("base64")}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
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
  const products =
    request.products && request.products.length > 0
      ? request.products
      : [
          {
            id: request.productId,
            color: request.color,
            size: request.size,
            quantity: request.quantity,
          },
        ];
  const response = await fetch(`${API_URL}/quote`, {
    method: "POST",
    headers: authHeaders(key),
    body: JSON.stringify({
      type: request.printType,
      name: request.name,
      ...(designId ? { designId } : { sides: { front: 1 } }),
      products,
      address: request.address ?? quoteAddress(),
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

export async function placeOrder(orderToken: string): Promise<PrintOrder> {
  const key = scalablePressKey();
  const response = await fetch(`${API_URL}/order`, {
    method: "POST",
    headers: authHeaders(key),
    body: JSON.stringify({ orderToken }),
  });

  const body = (await response.json().catch(() => null)) as PrintOrder | { message?: string } | null;
  if (!response.ok) {
    const message =
      body && "message" in body && body.message
        ? body.message
        : `Scalable Press returned ${response.status}.`;
    throw new ScalablePressError(message, response.status, body);
  }

  return (body ?? {}) as PrintOrder;
}
