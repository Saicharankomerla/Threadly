import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import WishlistButton from "@/components/wishlistButton";

export default async function WishlistPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: items } = await supabase
    .from("wishlist_items")
    .select("id, product_id, products(id, name, price, image_url, is_active)")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-display text-2xl mb-6">My Wishlist</h1>

      {(!items || items.length === 0) && (
        <p className="text-ink/60">
          Nothing saved yet. Browse the catalog and tap the heart on anything you like.
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {items?.map((item: any) => {
          const product = item.products;
          if (!product) return null; // product may have been deleted since saving
          return (
            <div key={item.id} className="group relative">
              <Link href={`/products/${product.id}`}>
                <div className="aspect-[3/4] bg-line/20 overflow-hidden mb-2">
                  {product.image_url && (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      width={400}
                      height={533}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                    />
                  )}
                </div>
                <p className="text-sm">{product.name}</p>
                <p className="text-sm text-ink/60">
                  ₹{Number(product.price).toFixed(2)}
                  {!product.is_active && (
                    <span className="ml-2 text-xs text-red-600">No longer available</span>
                  )}
                </p>
              </Link>
              <div className="absolute top-2 right-2">
                <WishlistButton productId={product.id} initialInWishlist={true} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
