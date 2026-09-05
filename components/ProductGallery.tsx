"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return (
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-line/40">
        <div className="flex h-full items-center justify-center text-ink/30">
          No image
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-line/40">
        <Image
          src={images[selected]}
          alt={productName}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i)}
              aria-label={`View photo ${i + 1}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-line/40 ${
                i === selected ? "ring-2 ring-thread" : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={url} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
