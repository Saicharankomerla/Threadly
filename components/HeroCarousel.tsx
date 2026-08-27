"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { categoryToSlug } from "@/lib/categories";

type HeroProduct = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
};

type Slide = {
  label: string;
  headline: string;
  description: string;
  href: string;
  imageUrl: string | null;
  gradientFrom: string;
  gradientTo: string;
  cta: string;
};

export default function HeroCarousel({ product }: { product: HeroProduct | null }) {
  const slides: Slide[] = [
    {
      label: "New arrivals",
      headline: "Traditional wear.",
      description: "Looks great for your special events.",
      href: `/category/${categoryToSlug("Traditional wear")}`,
      imageUrl: "/hero-1.jpg",
      gradientFrom: "from-ink",
      gradientTo: "to-thread",
      cta: "Shop the latest",
    },
    {
      label: "New collection",
      headline: "Fresh arrivals.",
      description: "Hand-picked pieces, added regularly.",
      href: "/",
      imageUrl: "/hero-2.jpg",
      gradientFrom: "from-clay",
      gradientTo: "to-ink",
      cta: "Browse the catalog",
    },
    {
      label: "Essentials",
      headline: "The everyday edit.",
      description: "Wardrobe staples, delivered by hand.",
      href: "/",
      imageUrl: "/hero-3.jpg",
      gradientFrom: "from-thread",
      gradientTo: "to-ink",
      cta: "Shop essentials",
    },
  ];

  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
  }

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goTo(i: number) {
    setIndex(i);
    startTimer();
  }

  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen mb-12 md:mb-16">
      <div className="relative aspect-[4/5] sm:aspect-[16/10] md:aspect-[16/7] w-full overflow-hidden bg-ink">
        <div
          className="flex h-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div key={i} className="relative h-full w-full flex-shrink-0">
              {slide.imageUrl ? (
                <Image
                  src={slide.imageUrl}
                  alt={slide.headline}
                  fill
                  priority={i === 0}
                  className="object-cover opacity-90"
                  sizes="100vw"
                />
              ) : (
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${slide.gradientFrom} ${slide.gradientTo}`}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />

              <div className="absolute inset-0 flex flex-col items-start justify-end p-6 sm:p-10 md:p-14">
                <p className="text-paper/70 text-xs uppercase tracking-[0.2em] mb-3">
                  {slide.label}
                </p>
                <h1 className="font-display text-paper text-3xl sm:text-4xl md:text-5xl max-w-md leading-tight">
                  {slide.headline}
                </h1>
                <p className="text-paper/80 text-sm sm:text-base mt-3 max-w-sm">
                  {slide.description}
                </p>
                <Link
                  href={slide.href}
                  className="mt-6 inline-flex items-center gap-2 bg-paper text-ink text-xs uppercase tracking-widest font-medium px-6 py-3 hover:bg-paper/90 transition-colors"
                >
                  {slide.cta}
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-paper" : "w-1.5 bg-paper/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}