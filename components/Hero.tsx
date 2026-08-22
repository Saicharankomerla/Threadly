import Image from "next/image";
import Link from "next/link";

type HeroProduct = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
};

export default function Hero({ product }: { product: HeroProduct | null }) {
  return (
    <section className="relative -mx-4 sm:-mx-6 md:mx-0 mb-12 md:mb-16">
      <div className="relative aspect-[4/5] sm:aspect-[16/10] md:aspect-[16/7] w-full overflow-hidden bg-ink">
        {product?.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            priority
            className="object-cover opacity-90"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-ink via-thread to-ink" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />

        <div className="absolute inset-0 flex flex-col items-start justify-end p-6 sm:p-10 md:p-14">
          <p className="text-paper/70 text-xs uppercase tracking-[0.2em] mb-3">
            New arrivals
          </p>
          <h1 className="font-display text-paper text-3xl sm:text-4xl md:text-5xl max-w-md leading-tight">
            Hand-picked. Hand-delivered.
          </h1>
          <p className="text-paper/80 text-sm sm:text-base mt-3 max-w-sm">
            I personally source every piece and bring it to your door.
          </p>
          {product && (
            <Link
              href={`/products/${product.id}`}
              className="mt-6 inline-flex items-center gap-2 bg-paper text-ink text-xs uppercase tracking-widest font-medium px-6 py-3 hover:bg-paper/90 transition-colors"
            >
              Shop the latest
              <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
