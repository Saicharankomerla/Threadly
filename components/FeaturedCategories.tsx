import Image from "next/image";
import Link from "next/link";
import { CATEGORIES, categoryToSlug } from "@/lib/categories";

type CategoryImage = {
  category: string;
  imageUrl: string | null;
};

// Categories that are fully live (nav, category pages, product tagging)
// but aren't ready to show on the homepage grid yet — no products/photos
// tagged for them so far. Remove an entry here once it's ready to show.
const HIDDEN_FROM_HOMEPAGE = ["College wear", "Modern Classics"];

export default function FeaturedCategories({
  images,
}: {
  images: CategoryImage[];
}) {
  const imageByCategory = new Map(images.map((i) => [i.category, i.imageUrl]));
  const homepageCategories = CATEGORIES.filter(
    (category) => !HIDDEN_FROM_HOMEPAGE.includes(category)
  );

  return (
    <section className="mb-12 md:mb-16">
      <h2 className="text-center text-sm font-medium uppercase tracking-[0.2em] text-ink/60 mb-6">
        Featured categories
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {homepageCategories.map((category) => {
          const imageUrl = imageByCategory.get(category) ?? null;
          return (
            <Link
              key={category}
              href={`/category/${categoryToSlug(category)}`}
              className="group"
            >
              <p className="font-display text-lg mb-2">{category}</p>
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-line/40">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={category}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-ink/30 text-xs">
                    Coming soon
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}