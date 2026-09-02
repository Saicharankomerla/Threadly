"use client";

import { useState } from "react";

export default function FooterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-paper/10 py-3 sm:border-none sm:py-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between sm:pointer-events-none"
      >
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="sm:hidden text-lg leading-none text-paper/60">
          {open ? "−" : "+"}
        </span>
      </button>
      <div className={`${open ? "block" : "hidden"} sm:block mt-3 sm:mt-4`}>
        {children}
      </div>
    </div>
  );
}
