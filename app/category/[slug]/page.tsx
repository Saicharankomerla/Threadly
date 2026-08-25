import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import { slugToCategory } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = slugToCategory(params.slug);

  if (!category) {
    notFound();
  }

  const supabase = createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, image_url, category, stock")
    .eq("is_active", true)
    .eq("category", category)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-end justify-between border-b border-line pb-3">
        <h1 className="font-display text-2xl">{category}</h1>
        <Link
          href="/"
          className="text-xs uppercase tracking-widest text-ink/50 hover:text-ink"
        >
          ← Back to home
        </Link>
      </div>

      {error && (
        <p className="text-red-600 text-sm">Couldn't load products: {error.message}</p>
      )}

      {products && products.length === 0 && (
        <p className="text-ink/60">No {category.toLowerCase()} yet — check back soon.</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {products?.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
