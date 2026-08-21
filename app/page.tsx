import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import Hero from "@/components/Hero";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const supabase = createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, image_url, category, stock")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const heroProduct = products?.find((p) => p.image_url) ?? null;

  return (
    <div>
      <Hero product={heroProduct} />

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
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
      >
        {products?.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}