export const CATEGORIES = [
  "Shirts",
  "T-shirts",
  "Trousers",
  "Shorts",
  "Shoes",
  "Watches",
  "Traditional wear",
  "College wear",
  "Modern Classics",
] as const;

export type Category = (typeof CATEGORIES)[number];

// "T-shirts" -> "t-shirts", "Trousers" -> "trousers"
export function categoryToSlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-");
}

// "t-shirts" -> "T-shirts". Returns null if the slug doesn't match a known category.
export function slugToCategory(slug: string): Category | null {
  const match = CATEGORIES.find((c) => categoryToSlug(c) === slug);
  return match ?? null;
}