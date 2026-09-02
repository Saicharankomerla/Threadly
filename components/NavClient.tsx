"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SignOutButton from "./SignOutButton";
import CartIcon from "./CartIcon";
import SearchBar from "./SearchBar";
import AdminOrdersBadge from "./AdminOrdersBadge";
import { CATEGORIES, categoryToSlug } from "@/lib/categories";

const linkClass =
  "text-xs font-medium uppercase tracking-widest text-ink/70 hover:text-ink py-5";

export default function NavClient({
  isLoggedIn,
  isAdmin,
  wishlistCount,
  pendingOrdersCount,
}: {
  isLoggedIn: boolean;
  isAdmin: boolean;
  wishlistCount: number;
  pendingOrdersCount: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-line bg-paper/95 backdrop-blur sticky top-0 z-20">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6">
        {/* Left: desktop text nav (hidden on mobile), hamburger button (mobile only) */}
        <div className="justify-self-start flex items-center">
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden p-1 -ml-1 text-ink/70"
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>

          <nav className="hidden md:flex items-center gap-8">
            <div className="group relative h-full">
              <Link href="/" className={linkClass}>
                Men
              </Link>
              <div className="absolute left-0 top-full hidden w-72 border border-line bg-paper shadow-lg group-hover:block">
                <div className="flex flex-col py-4">
                  <Link
                    href="/"
                    className="px-5 py-2 text-xs uppercase tracking-widest text-ink/70 hover:text-ink hover:bg-line/30"
                  >
                    New in
                  </Link>
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat}
                      href={`/category/${categoryToSlug(cat)}`}
                      className="px-5 py-2 text-xs uppercase tracking-widest text-ink/70 hover:text-ink hover:bg-line/30"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link href="/" className={linkClass}>
              Home
            </Link>
            {isAdmin && (
              <div className="group relative h-full">
                <span className={`${linkClass} inline-flex items-center cursor-pointer`}>
                  Admin
                  <AdminOrdersBadge initialCount={pendingOrdersCount} />
                </span>
                <div className="absolute left-0 top-full hidden w-56 border border-line bg-paper shadow-lg group-hover:block">
                  <div className="flex flex-col py-4">
                    <Link
                      href="/admin"
                      className="px-5 py-2 text-xs uppercase tracking-widest text-ink/70 hover:text-ink hover:bg-line/30 inline-flex items-center justify-between"
                    >
                      Orders
                      <AdminOrdersBadge initialCount={pendingOrdersCount} />
                    </Link>
                    <Link
                      href="/admin/analytics"
                      className="px-5 py-2 text-xs uppercase tracking-widest text-ink/70 hover:text-ink hover:bg-line/30"
                    >
                      Analytics
                    </Link>
                    <Link
                      href="/admin/products"
                      className="px-5 py-2 text-xs uppercase tracking-widest text-ink/70 hover:text-ink hover:bg-line/30"
                    >
                      Manage products
                    </Link>
                  </div>
                </div>
              </div>
            )}
            <Link href="/about" className={linkClass}>
              About us
            </Link>
          </nav>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-3 py-2 sm:py-4 justify-self-center"
          aria-label="Komerla — Fashion House"
        >
          <Image
            src="/logo.png"
            alt=""
            width={56}
            height={40}
            priority
            className="h-7 w-auto sm:h-10"
          />
          <span className="flex flex-col leading-none">
            <span className="font-display text-base sm:text-xl tracking-wide">KOMERLA</span>
            <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-ink/50 mt-0.5 sm:mt-1">
              Fashion House
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-5 justify-self-end">
          <span className="scale-90 sm:scale-100 origin-center">
            <SearchBar />
          </span>

          <Link
            href={isLoggedIn ? "/wishlist" : "/login"}
            aria-label="Wishlist"
            title="Wishlist"
            className="relative text-ink/70 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-[18px] w-[18px] sm:h-5 sm:w-5">
              <path d="M12 21s-7.5-4.7-10-9.3C.3 8.1 2 4.5 5.6 4c2-.3 3.8.7 4.9 2.3.7 1 .7 1 1.4 0C13 4.7 14.8 3.7 16.9 4c3.6.5 5.3 4.1 3.6 7.7C19.5 16.3 12 21 12 21z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[10px] leading-none text-paper">
                {wishlistCount}
              </span>
            )}
          </Link>

          <span className="scale-90 sm:scale-100 origin-center">
            <CartIcon />
          </span>

          <Link
            href={isLoggedIn ? "/profile" : "/login"}
            aria-label="Account"
            className="hidden sm:inline-flex text-ink/70 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
            </svg>
          </Link>

          {isLoggedIn ? (
            <SignOutButton />
          ) : (
            <Link
              href="/login"
              className="text-[10px] sm:text-xs font-medium uppercase tracking-widest border border-ink px-2.5 sm:px-4 py-1.5 sm:py-2 hover:bg-ink hover:text-paper transition-colors"
            >
              Log in
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu panel — sits in normal flow directly below the header row */}
      {menuOpen && (
        <div className="md:hidden border-t border-line bg-paper max-h-[75vh] overflow-y-auto">
          <div className="flex flex-col py-2">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="px-6 py-3 text-xs uppercase tracking-widest text-ink/70 border-b border-line"
            >
              New in
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/category/${categoryToSlug(cat)}`}
                onClick={() => setMenuOpen(false)}
                className="px-6 py-3 text-xs uppercase tracking-widest text-ink/70 border-b border-line"
              >
                {cat}
              </Link>
            ))}
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="px-6 py-3 text-xs uppercase tracking-widest text-ink/70 border-b border-line"
            >
              Home
            </Link>
            {isAdmin && (
              <>
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="px-6 py-3 text-xs uppercase tracking-widest text-ink/70 border-b border-line inline-flex items-center justify-between"
                >
                  Admin · Orders
                  <AdminOrdersBadge initialCount={pendingOrdersCount} />
                </Link>
                <Link
                  href="/admin/analytics"
                  onClick={() => setMenuOpen(false)}
                  className="px-6 py-3 text-xs uppercase tracking-widest text-ink/70 border-b border-line"
                >
                  Admin · Analytics
                </Link>
                <Link
                  href="/admin/products"
                  onClick={() => setMenuOpen(false)}
                  className="px-6 py-3 text-xs uppercase tracking-widest text-ink/70 border-b border-line"
                >
                  Admin · Manage products
                </Link>
              </>
            )}
            <Link
              href="/about"
              onClick={() => setMenuOpen(false)}
              className="px-6 py-3 text-xs uppercase tracking-widest text-ink/70 border-b border-line"
            >
              About us
            </Link>
            <Link
              href={isLoggedIn ? "/profile" : "/login"}
              onClick={() => setMenuOpen(false)}
              className="px-6 py-3 text-xs uppercase tracking-widest text-ink/70"
            >
              {isLoggedIn ? "My account" : "Log in"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
