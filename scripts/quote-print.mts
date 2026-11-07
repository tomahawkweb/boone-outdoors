import { readFileSync } from "node:fs";
import { quotePrintBlanks } from "../lib/print-blanks.ts";

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

function money(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function dollars(amount: number | undefined) {
  if (amount === undefined) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

loadEnv(".env.local");

const city = process.env.SCALABLEPRESS_QUOTE_CITY?.trim() || "Lexington";
const state = process.env.SCALABLEPRESS_QUOTE_STATE?.trim() || "KY";
const zip = process.env.SCALABLEPRESS_QUOTE_ZIP?.trim() || "40507";

const quotes = await quotePrintBlanks();

console.log(`Shipping estimate to ${city}, ${state} ${zip}.`);
console.log("These quotes have no artwork yet. They are a cost check, not an order.\n");

for (const item of quotes) {
  console.log(item.name);
  console.log(`  Blank: ${item.blank}`);
  console.log(`  Sell price: ${money(item.sellPriceCents)}`);
  console.log(`  Landed-cost ceiling: ${money(item.ceilingCents)}`);
  if (item.error || !item.quote) {
    console.log(`  Quote: ${item.error ?? "No quote returned."}\n`);
    continue;
  }
  const landed = (item.quote.subtotal ?? 0) + (item.quote.shipping ?? 0) + (item.quote.fees ?? 0);
  const landedCents = Math.round(landed * 100);
  const clears = landedCents <= item.ceilingCents;
  console.log(`  Mode: ${item.quote.mode ?? "unknown"}`);
  console.log(
    `  Quote: ${dollars(item.quote.total)} (goods ${dollars(item.quote.subtotal)}, shipping ${dollars(item.quote.shipping)}, fees ${dollars(item.quote.fees)}, tax ${dollars(item.quote.tax)})`,
  );
  console.log(`  Goods + shipping + fees: ${money(landedCents)}`);
  console.log(`  Clears the 30% floor: ${clears ? "yes" : "no"}`);
  for (const issue of [...(item.quote.issues ?? []), ...(item.quote.orderIssues ?? [])]) {
    if (issue.message) console.log(`  Note: ${issue.message}`);
  }
  console.log("");
}

if (quotes.some((item) => item.error || !item.quote)) {
  process.exitCode = 1;
}
