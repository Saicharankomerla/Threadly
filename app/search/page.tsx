import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q || "").trim();
  // Strip characters that would break the ilike filter syntax below
  const safeQ = q.replace(/[%_,]/g, " ").trim();

  const supabase = createClient();

  let products: any[] = [];
  if (safeQ) {
    const { data } = await supabase
      .from("products")
      .select("id, name, price, image_url, category, stock")
      .eq("is_active", true)
      .or(`name.ilike.%${safeQ}%,description.ilike.%${safeQ}%`)
      .order("created_at", { ascending: false });
    products = data || [];
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-display text-2xl mb-2">
        {q ? `Search results for "${q}"` : "Search"}
      </h1>
      <p className="text-sm text-ink/60 mb-6">
        {q
          ? `${products.length} ${products.length === 1 ? "result" : "results"} found`
          : "Use the search icon in the header to find products."}
      </p>

      {q && products.length === 0 && (
        <p className="text-ink/60">
          No products matched &quot;{q}&quot;. Try a different search term.
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
