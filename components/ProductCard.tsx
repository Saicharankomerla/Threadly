import Link from "next/link";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string | null;
  stock: number;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="card group overflow-hidden">
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
  );
}
