import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const supabase = createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, image_url, category, stock")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl">The Catalog</h1>
        <p className="mt-1 text-ink/60">
          Hand-picked pieces. Place an order and I'll buy and deliver it to you.
        </p>
      </div>

      {error && (
        <p className="text-red-600 text-sm">Couldn't load products: {error.message}</p>
      )}

      {products && products.length === 0 && (
        <p className="text-ink/60">No products yet — check back soon.</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {products?.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
