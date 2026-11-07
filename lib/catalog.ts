export type DepartmentId = "packs-and-bags" | "camp-and-hike" | "carry" | "fishing" | "wear";

export type ProductUse = "light" | "water" | "bait" | "apparel" | "bracelet";

export type Product = {
  slug: string;
  name: string;
  priceCents: number;
  department: DepartmentId;
  summary: string;
  story: string[];
  specs: { label: string; value: string }[];
  uses: ProductUse[];
  alsoIn?: DepartmentId[];
  trendingUntil?: string;
  trendingNote?: string;
  evergreen?: boolean;
};

export type Guide = {
  slug: string;
  title: string;
  dek: string;
  paragraphs: string[];
  productSlugs: string[];
};

export const departments: { id: DepartmentId; label: string; path: string; intro: string }[] = [
  {
    id: "packs-and-bags",
    label: "Packs & Bags",
    path: "/packs-and-bags",
    intro: "Day packs and slings sized for a hike, a commute, or the gear that has to come along.",
  },
  {
    id: "camp-and-hike",
    label: "Camp & Hike",
    path: "/camp-and-hike",
    intro: "Small camp kit: something to drink from, a light, and a pad for a break on the trail.",
  },
  {
    id: "carry",
    label: "Carry",
    path: "/carry",
    intro: "Pouches and organizers for the small things that get lost in a larger bag.",
  },
  {
    id: "fishing",
    label: "Fishing",
    path: "/fishing",
    intro: "Artificial bait for the bank, plus hats and shirts you can wear on the water.",
  },
  {
    id: "wear",
    label: "Wear",
    path: "/wear",
    intro: "Hats, shirts, and stone bracelets for the trail and the water.",
  },
];

export const products: Product[] = [
  {
    slug: "ridge-daypack",
    name: "Ridge Daypack",
    priceCents: 12900,
    department: "packs-and-bags",
    summary: "A 28 liter pack for a day on the trail.",
    story: [
      "One main compartment, a lid pocket, and a sternum strap. It is meant for a layer, water, and lunch, not a week of food.",
      "Capacity and weight below come from the supplier sheet. We will replace them after we measure a sample.",
    ],
    specs: [
      { label: "Capacity", value: "28 L" },
      { label: "Listed weight", value: "2.4 lb" },
    ],
    uses: [],
    trendingUntil: "2026-11-21",
    trendingNote: "Day-hike packs are the search we are watching this week.",
    evergreen: true,
  },
  {
    slug: "field-sling",
    name: "Field Sling",
    priceCents: 6400,
    department: "packs-and-bags",
    summary: "A sling for a bottle, a layer, and the small things.",
    story: [
      "It sits across the chest so a map and a snack stay in reach. The strap adjusts.",
      "True weight and hardware notes wait on a sample in hand.",
    ],
    specs: [
      { label: "Capacity", value: "8 L" },
      { label: "Listed weight", value: "14 oz" },
    ],
    uses: [],
    trendingUntil: "2026-11-21",
    trendingNote: "Slings keep showing up beside day packs in trail clips.",
  },
  {
    slug: "admin-organizer",
    name: "Admin Organizer",
    priceCents: 3600,
    department: "carry",
    summary: "A flat pouch for the things that vanish in a larger bag.",
    story: [
      "It slides into the daypack or rides on a belt. Pens, a lighter, a small light, and a cord stay in one place.",
      "Dimensions are from the supplier sheet until we measure one.",
    ],
    specs: [
      { label: "Size", value: "8 × 5 × 2 in" },
      { label: "Listed weight", value: "4 oz" },
    ],
    uses: [],
    trendingUntil: "2026-11-21",
    trendingNote: "Organization is the use people ask for when a pack gets noisy.",
    evergreen: true,
  },
  {
    slug: "belt-pouch",
    name: "Belt Pouch",
    priceCents: 3200,
    department: "carry",
    summary: "A small pouch that stays on a belt.",
    story: [
      "For a knife you already own, a cord, or a snack, when you do not want a pack. We do not sell blades.",
      "The belt loop width is a supplier figure.",
    ],
    specs: [
      { label: "Size", value: "6 × 4 × 2 in" },
      { label: "Loop", value: "Fits a 1.5 in belt" },
    ],
    uses: [],
    evergreen: true,
  },
  {
    slug: "trail-lantern",
    name: "Trail Lantern",
    priceCents: 4200,
    department: "camp-and-hike",
    summary: "A small lantern for camp, not a weapon light.",
    story: [
      "It hangs or sits. We will publish runtime only after we time a sample on the batteries it actually uses.",
    ],
    specs: [
      { label: "Power", value: "3 AA cells, not included" },
      { label: "Listed weight", value: "9 oz without cells" },
    ],
    uses: ["light"],
    evergreen: true,
  },
  {
    slug: "steel-camp-mug",
    name: "Steel Camp Mug",
    priceCents: 2800,
    department: "camp-and-hike",
    summary: "A single-wall steel mug for coffee at the trailhead.",
    story: [
      "Single wall means the rim gets hot. It is a camp mug, not an insulated bottle.",
    ],
    specs: [
      { label: "Capacity", value: "12 oz" },
      { label: "Material", value: "Stainless steel" },
    ],
    uses: ["water"],
  },
  {
    slug: "trail-bottle",
    name: "Trail Bottle",
    priceCents: 2200,
    department: "camp-and-hike",
    summary: "A simple one-liter bottle with a wide mouth.",
    story: [
      "Wide mouth so it fills from a jug or a tap. It is not a filter and we do not claim it purifies water.",
    ],
    specs: [
      { label: "Capacity", value: "1 L" },
      { label: "Material", value: "Stainless steel" },
    ],
    uses: ["water"],
  },
  {
    slug: "sit-pad",
    name: "Sit Pad",
    priceCents: 2400,
    department: "camp-and-hike",
    summary: "A closed-cell pad for a break on wet ground.",
    story: [
      "Folds into the daypack. It is a seat, not a sleeping pad.",
    ],
    specs: [
      { label: "Size", value: "15 × 12 × 0.4 in" },
      { label: "Material", value: "Closed-cell foam" },
    ],
    uses: [],
  },
  {
    slug: "creek-bait",
    name: "Creek Bait Pack",
    priceCents: 1200,
    department: "fishing",
    summary: "Soft-plastic bait for bank fishing.",
    story: [
      "Artificial bait in one pack. It does not need ice, and it is not live.",
    ],
    specs: [
      { label: "Count", value: "10 baits" },
      { label: "Type", value: "Soft plastic" },
    ],
    uses: ["bait"],
  },
  {
    slug: "bank-spinner",
    name: "Bank Spinner",
    priceCents: 900,
    department: "fishing",
    summary: "A small inline spinner for creeks and ponds.",
    story: ["A single lure. Hook size and true weight wait on a sample."],
    specs: [{ label: "Weight", value: "1/8 oz" }],
    uses: ["bait"],
  },
  {
    slug: "field-cap",
    name: "Field Cap",
    priceCents: 2800,
    department: "wear",
    alsoIn: ["fishing"],
    summary: "An unstructured cap for the trail or the boat.",
    story: ["Adjustable, with a soft brim. Colorways come from the apparel supplier."],
    specs: [{ label: "Style", value: "Unstructured, adjustable" }],
    uses: ["apparel"],
    evergreen: true,
  },
  {
    slug: "trail-shirt",
    name: "Trail Shirt",
    priceCents: 3600,
    department: "wear",
    alsoIn: ["fishing"],
    summary: "A short-sleeve shirt for a warm day outside.",
    story: ["Meant for the trail and the bank. Sizes run S through XXL once the supplier sheet is confirmed."],
    specs: [
      { label: "Fabric", value: "Cotton blend" },
      { label: "Sizes", value: "S–XXL" },
    ],
    uses: ["apparel"],
  },
  {
    slug: "stone-bracelet",
    name: "Stone Bead Bracelet",
    priceCents: 2400,
    department: "wear",
    summary: "An 8 mm stretch bracelet in black stone and tiger eye.",
    story: [
      "Elastic cord, sold as one bracelet. Stone color varies from piece to piece.",
      "It is jewelry for an outdoor day. The beads are not claimed to do anything beyond how they look.",
    ],
    specs: [
      { label: "Bead size", value: "8 mm" },
      { label: "Cord", value: "Elastic" },
      { label: "Fit", value: "About 7.5–10 in" },
    ],
    uses: ["bracelet"],
  },
];

export const guides: Guide[] = [
  {
    slug: "day-hike",
    title: "What to pack for a day hike",
    dek: "A short list for a trail you will finish before dark.",
    paragraphs: [
      "Carry water, a layer you can put on when you stop, and a way to keep the small things from rattling loose. The pack below is sized for that day, not for an overnight.",
      "Add the lantern only if you may walk out in the dusk. Leave the sleeping kit at home.",
    ],
    productSlugs: ["ridge-daypack", "trail-bottle", "admin-organizer", "trail-lantern"],
  },
  {
    slug: "truck-kit",
    title: "A kit for the truck",
    dek: "What stays behind the seat for a workday or a trailhead.",
    paragraphs: [
      "The sling holds a bottle and a layer. The pouch holds the small tools you already own. The mug is for a stop, not a camp.",
      "This is the same gear as a day hike, packed for a cab instead of a trail.",
    ],
    productSlugs: ["field-sling", "belt-pouch", "steel-camp-mug"],
  },
  {
    slug: "bank-kit",
    title: "A kit for the bank",
    dek: "Bait, a cap, and a shirt for a few hours by the water.",
    paragraphs: [
      "Take artificial bait so nothing has to stay on ice. The cap and shirt are the same ones in Wear.",
      "Live bait is not in this shop. It spoils, and the rules change by state.",
    ],
    productSlugs: ["creek-bait", "bank-spinner", "field-cap", "trail-shirt"],
  },
];

export function departmentById(id: DepartmentId) {
  return departments.find((department) => department.id === id)!;
}

export function productBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function guideBySlug(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}

export function isTrending(product: Product) {
  return Boolean(product.trendingUntil);
}

export function trendingProducts() {
  return products.filter((product) => isTrending(product));
}

export function evergreenProducts() {
  return products.filter((product) => product.evergreen);
}

export function productsInDepartment(
  id: DepartmentId,
  options?: { maxCents?: number; use?: ProductUse | "field" },
) {
  return products.filter((product) => {
    const listedHere = product.department === id || product.alsoIn?.includes(id);
    if (!listedHere) return false;
    if (options?.maxCents && product.priceCents > options.maxCents) return false;
    if (options?.use === "field" && product.uses.length === 0) return false;
    if (options?.use && options.use !== "field" && !product.uses.includes(options.use)) return false;
    return true;
  });
}

export function relatedProducts(product: Product) {
  return products.filter((item) => item.department === product.department && item.slug !== product.slug).slice(0, 3);
}

export function searchCatalog(query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  return products.filter((product) => {
    const haystack = [product.name, product.summary, departmentById(product.department).label, ...product.specs.map((spec) => spec.value)]
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });
}
