"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sizes: string[];
  stock: number;
  image_url: string | null;
  category: string | null;
  is_active: boolean;
  is_category_image: boolean;
};

const emptyForm = {
  name: "",
  description: "",
  price: "",
  sizes: "",
  stock: "",
  image_url: "",
  category: "",
  is_category_image: false,
};

export default function ProductsBoard({ initialProducts }: { initialProducts: Product[] }) {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      sizes: (p.sizes ?? []).join(", "),
      stock: String(p.stock),
      image_url: p.image_url ?? "",
      category: p.category ?? "",
      is_category_image: p.is_category_image ?? false,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name,
      description: form.description || null,
      price: Number(form.price),
      sizes: form.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      stock: Number(form.stock),
      image_url: form.image_url || null,
      category: form.category || null,
      is_category_image: form.is_category_image,
    };

    if (!payload.name || Number.isNaN(payload.price) || Number.isNaN(payload.stock)) {
      setError("Name, a valid price, and stock are required.");
      setSaving(false);
      return;
    }

    if (editingId) {
      const { data, error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", editingId)
        .select()
        .single();
      setSaving(false);
      if (error) {
        setError(error.message);
        return;
      }
      setProducts((prev) => prev.map((p) => (p.id === editingId ? (data as Product) : p)));
      resetForm();
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert({ ...payload, is_active: true })
        .select()
        .single();
      setSaving(false);
      if (error) {
        setError(error.message);
        return;
      }
      setProducts((prev) => [data as Product, ...prev]);
      resetForm();
    }
  }

  async function toggleActive(p: Product) {
    const { error } = await supabase
      .from("products")
      .update({ is_active: !p.is_active })
      .eq("id", p.id);
    if (error) {
      alert(error.message);
      return;
    }
    setProducts((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, is_active: !x.is_active } : x))
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-[320px_1fr]">
      <form onSubmit={handleSubmit} className="card p-4 h-fit space-y-3">
        <h2 className="font-medium">{editingId ? "Edit product" : "Add product"}</h2>

        <div>
          <label className="label">Name</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            className="input"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label">Price (₹)</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Stock</label>
            <input
              type="number"
              className="input"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="label">Sizes (comma separated)</label>
          <input
            className="input"
            placeholder="S, M, L, XL"
            value={form.sizes}
            onChange={(e) => setForm({ ...form, sizes: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Category</label>
          <input
            className="input"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_category_image"
            checked={form.is_category_image}
            onChange={(e) =>
              setForm({ ...form, is_category_image: e.target.checked })
            }
          />
          <label htmlFor="is_category_image" className="label mb-0">
            Use this product's photo as the category tile image
          </label>
        </div>
        <div>
          <label className="label">Image URL</label>
          <input
            className="input"
            placeholder="https://…"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          />
          <p className="mt-1 text-xs text-ink/50">
            Upload to the Supabase "product-images" storage bucket and paste the
            public URL here, or use any hosted image link.
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? "Saving…" : editingId ? "Save changes" : "Add product"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-2">
        {products.map((p) => (
          <div key={p.id} className="card p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {p.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="h-14 w-14 rounded object-cover bg-line/40"
                />
              )}
              <div>
                <p className="font-medium">
                  {p.name}{" "}
                  {!p.is_active && (
                    <span className="status-pill bg-line text-ink/60 ml-1">Inactive</span>
                  )}
                  {p.is_category_image && (
                    <span className="status-pill bg-line text-ink/60 ml-1">
                      Category image
                    </span>
                  )}
                </p>
                <p className="text-sm text-ink/60">
                  ₹{Number(p.price).toFixed(2)} · Stock: {p.stock}
                  {p.sizes?.length ? ` · Sizes: ${p.sizes.join(", ")}` : ""}
                </p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => startEdit(p)} className="btn-secondary">
                Edit
              </button>
              <button onClick={() => toggleActive(p)} className="btn-secondary">
                {p.is_active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && <p className="text-ink/60">No products yet — add one.</p>}
      </div>
    </div>
  );
}
