import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ProductsBoard from "./ProductsBoard";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const supabase = createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">Admin · Products</h1>
        <Link href="/admin" className="btn-secondary">
          Back to orders
        </Link>
      </div>
      <ProductsBoard initialProducts={products ?? []} />
    </div>
  );
}
