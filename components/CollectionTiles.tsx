import Image from "next/image";
import Link from "next/link";

type Tile = {
  title: string;
  subtitle: string;
  href: string;
  imageUrl?: string | null;
  gradientFrom: string;
  gradientTo: string;
};

const TILES: Tile[] = [
  {
    title: "New Collection",
    subtitle: "Fresh arrivals, hand-picked",
    href: "/",
    imageUrl: null,
    gradientFrom: "from-clay",
    gradientTo: "to-ink",
  },
  {
    title: "Essentials",
    subtitle: "The everyday edit",
    href: "/",
    imageUrl: null,
    gradientFrom: "from-thread",
    gradientTo: "to-ink",
  },
];

export default function CollectionTiles() {
  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen mb-12 md:mb-16 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {TILES.map((tile) => (
        <Link
          key={tile.title}
          href={tile.href}
          className="group relative block aspect-[4/5] overflow-hidden bg-ink"
        >
          {tile.imageUrl ? (
            <Image
              src={tile.imageUrl}
              alt={tile.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          ) : (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${tile.gradientFrom} ${tile.gradientTo}`}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />

          <div className="absolute inset-0 flex flex-col items-start justify-end p-6 sm:p-8">
            <p className="text-paper/70 text-xs uppercase tracking-[0.2em] mb-2">
              {tile.subtitle}
            </p>
            <h2 className="font-display text-paper text-2xl sm:text-3xl leading-tight mb-3">
              {tile.title}
            </h2>
            <span className="inline-flex items-center gap-2 text-paper text-xs uppercase tracking-widest border-b border-paper/60 pb-0.5 group-hover:border-paper transition-colors">
              Shop now
              <span aria-hidden>→</span>
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}