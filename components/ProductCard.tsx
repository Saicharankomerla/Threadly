import Link from "next/link";
import Image from "next/image";
import WishlistButton from "./WishlistButton";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string | null;
  stock: number;
};

export default function ProductCard({
  product,
  initialInWishlist = false,
}: {
  product: Product;
  initialInWishlist?: boolean;
}) {
  return (
    <div className="card group relative overflow-hidden">
      <div className="absolute top-2 right-2 z-10">
        <WishlistButton
          productId={product.id}
          initialInWishlist={initialInWishlist}
          className="bg-paper/80 backdrop-blur rounded-full p-1.5"
        />
      </div>

      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-line/40">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-ink/30 text-sm">
              No image
            </div>
          )}
          {product.stock <= 0 && (
            <span className="absolute top-2 left-2 status-pill bg-ink text-white">
              Out of stock
            </span>
          )}
        </div>
        <div className="p-3">
          {product.category && (
            <p className="text-xs uppercase tracking-wide text-ink/50">
              {product.category}
            </p>
          )}
          <h3 className="font-medium leading-snug">{product.name}</h3>
          <p className="mt-1 text-sm text-ink/70">₹{product.price.toFixed(2)}</p>
        </div>
      </Link>
    </div>
  );
}
