import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import HeroCarousel from "@/components/HeroCarousel";
import CollectionTiles from "@/components/CollectionTiles";
import Link from "next/link";
import FeaturedCategories from "@/components/FeaturedCategories";
import { CATEGORIES } from "@/lib/categories";
export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const supabase = createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, image_url, category, stock")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const heroProduct = products?.find((p) => p.image_url) ?? null;
  const categoryImages = await Promise.all(
    CATEGORIES.map(async (category) => {
      const pinned = await supabase
        .from("products")
        .select("image_url")
        .eq("is_active", true)
        .eq("category", category)
        .eq("is_category_image", true)
        .not("image_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(1);

      if (pinned.data && pinned.data.length > 0) {
        return { category, imageUrl: pinned.data[0].image_url ?? null };
      }

      const fallback = await supabase
        .from("products")
        .select("image_url")
        .eq("is_active", true)
        .eq("category", category)
        .not("image_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(1);

      return { category, imageUrl: fallback.data?.[0]?.image_url ?? null };
    })
  );

  return (
    <div>
      <HeroCarousel product={heroProduct} />
      <CollectionTiles />
      <FeaturedCategories images={categoryImages} />

      <div className="mb-6 flex items-end justify-between border-b border-line pb-3">
        <h2 className="font-display text-2xl">New in</h2>
        <Link
          href="#catalog"
          className="text-xs uppercase tracking-widest text-ink/50 hover:text-ink"
        >
          View all →
        </Link>
      </div>

      {error && (
        <p className="text-red-600 text-sm">Couldn't load products: {error.message}</p>
      )}

      {products && products.length === 0 && (
        <p className="text-ink/60">No products yet — check back soon.</p>
      )}

      <div
        id="catalog"
        className="grid grid-cols-2 gap-px bg-line/40 sm:gap-4 sm:bg-transparent sm:grid-cols-3 md:grid-cols-4"
      >
        {products?.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
