import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import OrderForm from "./OrderForm";
import WishlistButton from "@/components/wishlistButton";
import ProductGallery from "@/components/ProductGallery";
import ReviewsList from "@/components/ReviewsList";
import ReviewForm from "@/components/ReviewsForm";

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

  // Gallery: main photo (image_url) first, then any extra photos from
  // product_images, in their saved order.
  const { data: galleryRows } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("product_id", product.id)
    .order("sort_order", { ascending: true });

  const galleryImages = [
    ...(product.image_url ? [product.image_url] : []),
    ...(galleryRows ?? []).map((row) => row.image_url),
  ];

  // Reviews: fetched with the service-role client so we can also pull each
  // reviewer's display name, since RLS normally restricts a customer's
  // profiles row to themselves only.
  const serviceSupabase = createServiceRoleClient();

  const { data: reviewRows } = await serviceSupabase
    .from("product_reviews")
    .select("id, rating, comment, media_urls, created_at, customer_id")
    .eq("product_id", product.id)
    .order("created_at", { ascending: false });

  const customerIds = Array.from(
    new Set((reviewRows ?? []).map((r) => r.customer_id))
  );
  let namesByCustomerId: Record<string, string | null> = {};
  if (customerIds.length > 0) {
    const { data: profileRows } = await serviceSupabase
      .from("profiles")
      .select("id, full_name")
      .in("id", customerIds);
    namesByCustomerId = Object.fromEntries(
      (profileRows ?? []).map((p) => [p.id, p.full_name])
    );
  }

  const reviews = (reviewRows ?? []).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    media_urls: r.media_urls ?? [],
    created_at: r.created_at,
    customer_name: namesByCustomerId[r.customer_id] ?? null,
  }));

  // Review eligibility: a delivered order containing this product, and no
  // existing review from this customer for it yet.
  let eligibleOrderId: string | null = null;
  if (user) {
    const alreadyReviewed = (reviewRows ?? []).some(
      (r) => r.customer_id === user.id
    );

    if (!alreadyReviewed) {
      const { data: deliveredOrderItems } = await supabase
        .from("order_items")
        .select("order_id, orders!inner(id, status, customer_id)")
        .eq("product_id", product.id)
        .eq("orders.customer_id", user.id)
        .eq("orders.status", "delivered")
        .limit(1);

      if (deliveredOrderItems && deliveredOrderItems.length > 0) {
        eligibleOrderId = deliveredOrderItems[0].order_id;
      }
    }
  }

  const hasDiscount =
    product.compare_at_price && Number(product.compare_at_price) > Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round((1 - Number(product.price) / Number(product.compare_at_price)) * 100)
    : 0;

  return (
    <div>
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

          {/* Pricing — shows strikethrough + % off only when compare_at_price is set */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {hasDiscount && (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-700">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
                {discountPercent}%
              </span>
            )}
            {hasDiscount && (
              <span className="text-sm text-ink/40 line-through">
                ₹{Number(product.compare_at_price).toFixed(2)}
              </span>
            )}
            <span className="text-xl font-medium">
              ₹{Number(product.price).toFixed(2)}
            </span>
          </div>

          {product.description && (
            <p className="mt-4 text-ink/70">{product.description}</p>
          )}

          {/* Trust badges */}
          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-b border-line py-4 text-center">
            <div className="flex flex-col items-center gap-1.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink/60">
                <path d="M3 12a9 9 0 1 0 3-6.7" />
                <path d="M3 4v5h5" />
              </svg>
              <p className="text-xs text-ink/70 leading-tight">7-Day Returns</p>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink/60">
                <path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <p className="text-xs text-ink/70 leading-tight">Secure Payments</p>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink/60">
                <circle cx="12" cy="12" r="9" />
                <path d="m8.5 12.5 2.5 2.5 5-5" />
              </svg>
              <p className="text-xs text-ink/70 leading-tight">Personally Verified</p>
            </div>
          </div>

          {/* Delivery details — simplified for a hand-delivered, single-seller model */}
          <div className="mt-4 rounded-md border border-line p-4 space-y-3">
            <p className="text-sm font-medium">Delivery details</p>
            <div className="flex items-start gap-2.5 text-sm text-ink/70">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-0.5 shrink-0 text-ink/50">
                <rect x="1" y="7" width="15" height="10" rx="1" />
                <path d="M16 10h3l3 3v4h-6" />
                <circle cx="6" cy="19" r="1.5" />
                <circle cx="17.5" cy="19" r="1.5" />
              </svg>
              <span>Hand-delivered directly — no third-party courier.</span>
            </div>
            <div className="flex items-start gap-2.5 text-sm text-ink/70">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-0.5 shrink-0 text-ink/50">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
              </svg>
              <span>Pay securely online, or by bank transfer/UPI on delivery.</span>
            </div>
          </div>

          <div className="mt-6 border-t border-line pt-6">
            <OrderForm product={product} isLoggedIn={!!user} />
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-line pt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-display text-xl mb-4">Reviews</h2>
          <ReviewsList reviews={reviews} />
        </div>
        <div>
          {eligibleOrderId && (
            <ReviewForm productId={product.id} orderId={eligibleOrderId} />
          )}
        </div>
      </div>
    </div>
  );
}
