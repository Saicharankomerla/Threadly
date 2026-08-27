import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import OrderForm from "./OrderForm";
import WishlistButton from "@/components/wishlistButton";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check whether this specific product is already saved, so the heart
  // shows the correct filled/outline state on first load instead of
  // always starting empty.
  let initialInWishlist = false;
  if (user) {
    const { data: existing } = await supabase
      .from("wishlist_items")
      .select("id")
      .eq("customer_id", user.id)
      .eq("product_id", product.id)
      .maybeSingle();
    initialInWishlist = !!existing;
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-line/40">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink/30">
            No image
          </div>
        )}
      </div>

      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            {product.category && (
              <p className="text-xs uppercase tracking-wide text-ink/50">
                {product.category}
              </p>
            )}
            <h1 className="font-display text-2xl">{product.name}</h1>
          </div>
          <WishlistButton
            productId={product.id}
            initialInWishlist={initialInWishlist}
            className="mt-1 shrink-0"
          />
        </div>
        <p className="mt-1 text-xl">₹{Number(product.price).toFixed(2)}</p>
        {product.description && (
          <p className="mt-4 text-ink/70">{product.description}</p>
        )}

        <div className="mt-6 border-t border-line pt-6">
          <OrderForm product={product} isLoggedIn={!!user} />
        </div>
      </div>
    </div>
  );
}
