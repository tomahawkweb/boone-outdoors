import { productBySlug } from "./catalog.ts";
import { createQuote, type PrintType, type QuoteResult } from "./scalable-press.ts";

export type PrintBlank = {
  slug: "field-cap" | "trail-shirt";
  printType: PrintType;
  productId: string;
  color: string;
  size: string;
  blank: string;
  designId?: string;
};

/**
 * Blanks confirmed in the public Scalable Press catalog on 7 Nov 2026.
 * The cap is embroidery-only. The shirt is a Gildan 2000, which is 100% cotton.
 */
export const printBlanks: PrintBlank[] = [
  {
    slug: "field-cap",
    printType: "embr",
    productId: "port-company-port-company-six-panel-unstructured-twill-cap",
    color: "Black",
    size: "med",
    blank: "Port & Company C914 unstructured twill cap",
  },
  {
    slug: "trail-shirt",
    printType: "dtg",
    productId: "gildan-ultra-cotton-t-shirt",
    color: "Black",
    size: "lrg",
    blank: "Gildan 2000 Ultra Cotton t-shirt",
    designId: "6aef92ffb673366d1bf7e637",
  },
];

export type PrintQuote = {
  slug: PrintBlank["slug"];
  name: string;
  blank: string;
  sellPriceCents: number;
  ceilingCents: number;
  quote: QuoteResult | null;
  error: string | null;
};

export async function quotePrintBlanks(): Promise<PrintQuote[]> {
  const quotes: PrintQuote[] = [];

  for (const blank of printBlanks) {
    const product = productBySlug(blank.slug);
    if (!product) {
      quotes.push({
        slug: blank.slug,
        name: blank.slug,
        blank: blank.blank,
        sellPriceCents: 0,
        ceilingCents: 0,
        quote: null,
        error: "That product is missing from the catalog.",
      });
      continue;
    }

    try {
      const quote = await createQuote({
        name: product.slug,
        printType: blank.printType,
        productId: blank.productId,
        color: blank.color,
        size: blank.size,
        quantity: 1,
        designId: blank.designId,
      });
      quotes.push({
        slug: blank.slug,
        name: product.name,
        blank: blank.blank,
        sellPriceCents: product.priceCents,
        ceilingCents: Math.round(product.priceCents * 0.3),
        quote,
        error: null,
      });
    } catch (error) {
      quotes.push({
        slug: blank.slug,
        name: product.name,
        blank: blank.blank,
        sellPriceCents: product.priceCents,
        ceilingCents: Math.round(product.priceCents * 0.3),
        quote: null,
        error: error instanceof Error ? error.message : "Quote failed.",
      });
    }
  }

  return quotes;
}
