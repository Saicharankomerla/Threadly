import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import OrderForm from "./OrderForm";
import WishlistButton from "@/components/wishlistButton";
import ReviewForm from "@/components/ReviewsForm";
import ReviewsList from "@/components/ReviewsList";
import ProductGallery from "@/components/ProductGallery";

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

  // Reviews are public, but reviewer names live in `profiles`, which RLS
  // normally restricts to each user's own row — so this read uses the
  // service-role client to fetch just the names of people who reviewed.
  const serviceClient = createServiceRoleClient();
  const { data: reviewsRaw } = await serviceClient
    .from("product_reviews")
    .select("id, rating, comment, media_urls, created_at, customer_id")
    .eq("product_id", product.id)
    .order("created_at", { ascending: false });

  const customerIds = Array.from(new Set((reviewsRaw ?? []).map((r) => r.customer_id)));
  const { data: reviewerProfiles } = customerIds.length
    ? await serviceClient.from("profiles").select("id, full_name").in("id", customerIds)
    : { data: [] as { id: string; full_name: string | null }[] };

  const nameById = new Map((reviewerProfiles ?? []).map((p) => [p.id, p.full_name]));

  const reviews = (reviewsRaw ?? []).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    media_urls: r.media_urls ?? [],
    created_at: r.created_at,
    customer_name: nameById.get(r.customer_id) ?? null,
  }));

  // A customer can review this product only if they have a delivered order
  // that included it, and haven't already reviewed it.
  let eligibleOrderId: string | null = null;
  if (user) {
    const alreadyReviewed = (reviewsRaw ?? []).some((r) => r.customer_id === user.id);
    if (!alreadyReviewed) {
      const { data: eligibleOrder } = await supabase
        .from("orders")
        .select("id, order_items!inner(product_id)")
        .eq("customer_id", user.id)
        .eq("status", "delivered")
        .eq("order_items.product_id", product.id)
        .limit(1)
        .maybeSingle();
      eligibleOrderId = eligibleOrder?.id ?? null;
    }
  }

  // Main photo (image_url) comes first, followed by any additional gallery
  // photos in their saved order.
  const { data: extraImages } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("product_id", product.id)
    .order("sort_order", { ascending: true });

  const galleryImages = [
    ...(product.image_url ? [product.image_url] : []),
    ...(extraImages ?? []).map((row) => row.image_url),
  ];

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <ProductGallery images={galleryImages} productName={product.name} />

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

      <div className="md:col-span-2 mt-4 border-t border-line pt-8">
        <h2 className="font-display text-xl mb-6">Reviews</h2>

        {eligibleOrderId && (
          <div className="mb-8 max-w-md">
            <ReviewForm productId={product.id} orderId={eligibleOrderId} />
          </div>
        )}

        <div className="max-w-2xl">
          <ReviewsList reviews={reviews} />
        </div>
      </div>
    </div>
  );
}
