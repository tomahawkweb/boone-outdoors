# Daniel Boone Outdoors

Storefront for [danielbooneoutdoors.com](https://danielbooneoutdoors.com). Shoppers browse packs, camp kit, carry goods, fishing, and wear, keep a bag in the browser, and pay on the site with Stripe.

The assortment in this repo is a sample so the shop can be built. Specs are supplier-sheet placeholders. Measured figures and live shipping replace them before the store opens.

## Stack

- Next.js 16 (App Router) and React 19
- Tailwind CSS 4
- Stripe, with prices taken from the server catalog and the card field embedded on the checkout page
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
| `STRIPE_SECRET_KEY` | Test secret key (`sk_test_...`). |
| `STRIPE_LIVE_SECRET_KEY` | Optional live secret (`sk_live_...`). It can stay in the file. The shop uses it only when the process has `STRIPE_ALLOW_LIVE=1`. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Test publishable key (`pk_test_...`). The checkout page uses it for the card field. |
| `STRIPE_LIVE_PUBLISHABLE_KEY` | Optional live publishable key (`pk_live_...`). Paired with the live secret. |
| `NEXT_PUBLIC_SITE_URL` | Public site origin. Locally this is `http://localhost:3000`. |
| `STRIPE_WEBHOOK_SECRET` | Optional locally. Signing secret from `stripe listen` or the Stripe webhook endpoint. The success page also sends a paid order to print. |
| `SCALABLEPRESS_TEST_API_KEY` | Scalable Press test key (`test_...`). Used by the print quote check and the paid-order handoff. |
| `SCALABLEPRESS_LIVE_API_KEY` | Optional live key (`live_...`). It can stay in the file. The shop uses it only when the process has `SCALABLEPRESS_ALLOW_LIVE=1`. |
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

The bag is stored in `localStorage` under `dbo-bag`. Checkout stays on `/checkout`. That page posts `{ items: [{ slug, quantity, color, size }] }` to `/api/checkout`. The route looks each slug up in `lib/catalog.ts` and charges the catalog price. Quantity must be a whole number from 1 to 9. Color and size have to match the product. The shopper enters a US shipping address on the page, and the card field is Stripe’s secure field embedded in the page.

After payment, the shopper returns to `/checkout/success`. That page reads the payment from Stripe and clears the bag only when the payment is complete. It then sends printable items to Scalable Press. The Trail Shirt is the printable item. The Field Cap is skipped until embroidery ordering is available.

## Print quotes

Hats and shirts are quoted through Scalable Press before they replace the sample products. The first blanks are a Port & Company C914 unstructured cap and a Gildan 2000 t-shirt, in `lib/print-blanks.ts`.

```bash
npm run quote:print
```

The command reads `.env.local` and asks Scalable Press for one cap and one large black shirt, shipped to the quote ZIP. It prints the goods, shipping, and fees next to 30 percent of the current sell price. No artwork is uploaded and no order is placed. It uses the test key when both keys are in the file.

```bash
npm run test:handoff
```

That command pays for one Trail Shirt with the Stripe test card, then asks the running shop to place the Scalable Press order. Start `npm run dev` first. It requires the Scalable Press test key. The order is accepted and is not printed or shipped. Asking again with the same payment does not place a second order. If the file has a live key and no test key, the command stops before any order is sent.

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

Amazon, TikTok Shop, and hosting are outside this repository. This repo is the storefront, including the test handoff from a paid Stripe order to Scalable Press.
