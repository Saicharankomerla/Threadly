import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import PromoBar from "@/components/PromoBar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/lib/cart-context";

export const metadata: Metadata = {
  title: "Threadly",
  description: "Order clothing, delivered by hand.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-body min-h-screen bg-paper text-ink antialiased flex flex-col">
        <CartProvider>
          <PromoBar />
          <Nav />
          <main className="mx-auto max-w-6xl w-full px-4 py-8 flex-1">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
