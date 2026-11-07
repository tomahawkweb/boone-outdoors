import Stripe from "stripe";

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

export function stripeSecretKey() {
  if (process.env.STRIPE_ALLOW_LIVE === "1") {
    const live = matchingKey("sk_live_", ["STRIPE_LIVE_SECRET_KEY", "STRIPE_SECRET_KEY"]);
    if (live) return live;
  }
  return matchingKey("sk_test_", ["STRIPE_TEST_SECRET_KEY", "STRIPE_SECRET_KEY"]);
}

export function stripePublishableKey() {
  if (process.env.STRIPE_ALLOW_LIVE === "1") {
    const live = matchingKey("pk_live_", ["STRIPE_LIVE_PUBLISHABLE_KEY", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"]);
    if (live) return live;
  }
  return matchingKey("pk_test_", ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "STRIPE_TEST_PUBLISHABLE_KEY"]);
}

export function stripeClient(): { client: Stripe } | { error: string; status: number } {
  const secret = stripeSecretKey();
  if (!secret) {
    const liveOnly = matchingKey("sk_live_", ["STRIPE_LIVE_SECRET_KEY", "STRIPE_SECRET_KEY"]);
    if (liveOnly) {
      return {
        error: "The live Stripe secret can stay in .env.local. Add the test secret as STRIPE_SECRET_KEY.",
        status: 503,
      };
    }
    return {
      error: "Stripe is not configured yet. Add the test secret key to .env.local.",
      status: 503,
    };
  }
  return { client: new Stripe(secret) };
}
