# Daniel Boone Outdoors

Storefront for [danielbooneoutdoors.com](https://danielbooneoutdoors.com). Shoppers browse packs, camp kit, carry goods, fishing, and wear, keep a bag in the browser, and pay with Stripe Checkout.

The assortment in this repo is a sample so the shop can be built. Specs are supplier-sheet placeholders. Measured figures and live shipping replace them before the store opens.

## Stack

- Next.js 16 (App Router) and React 19
- Tailwind CSS 4
- Stripe Checkout, with prices taken from the server catalog
- TypeScript

## Requirements

- Node.js 20 or newer
- npm

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If that port is already taken, Next prints the port it bound.

## Environment

| Variable | Purpose |
| --- | --- |
| `STRIPE_SECRET_KEY` | Secret key for Checkout. Use a test key (`sk_test_...`) locally. |
| `NEXT_PUBLIC_SITE_URL` | Origin used for Checkout success and cancel URLs. Locally this is `http://localhost:3000`. |
| `SCALABLEPRESS_API_KEY` | Scalable Press test key (`test_...`). Used by the print quote check. |
| `SCALABLEPRESS_QUOTE_ZIP` | Optional ZIP for that shipping estimate. Defaults to 40507. |

`.env*` files stay out of git. `.env.example` is the template.

Without `STRIPE_SECRET_KEY`, the bag still works. Checkout returns a clear error instead of opening Stripe.

## Shop

Primary navigation:

- `/trending`
- `/packs-and-bags`
- `/camp-and-hike`
- `/carry`
- `/fishing`
- `/wear`
- `/guides`

Also: `/shop`, `/search`, `/bag`, `/about`, `/policies`, and `/products/[slug]`.

The bag is stored in `localStorage` under `dbo-bag`. Checkout posts `{ items: [{ slug, quantity }] }` to `/api/checkout`. The route looks each slug up in `lib/catalog.ts` and sends Stripe the catalog price. Quantity must be a whole number from 1 to 9.

After payment, Stripe returns the shopper to `/checkout/success`, which clears the bag.

## Print quotes

Hats and shirts are quoted through Scalable Press before they replace the sample products. The first blanks are a Port & Company C914 unstructured cap and a Gildan 2000 t-shirt, in `lib/print-blanks.ts`.

```bash
npm run quote:print
```

The command reads `.env.local` and asks Scalable Press for one cap and one large black shirt, shipped to the quote ZIP. It prints the goods, shipping, and fees next to 30 percent of the current sell price. No artwork is uploaded and no order is placed. A key that starts with `live_` is refused.

## Catalog

Products and field guides live in `lib/catalog.ts`. Thirteen sample products and three guides ship with the app. Add a product there and the department pages, search, and product URLs pick it up.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the local dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Layout

```
app/           routes, layout, checkout API, sitemap
components/    header, footer, bag, product cards
lib/           catalog, navigation, money formatting
public/        logo and homepage photograph
```

Supplier purchasing, Amazon, TikTok Shop, and hosting are outside this repository. This repo is the storefront.
