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
  extraImages: [] as string[],
};

export default function ProductsBoard({ initialProducts }: { initialProducts: Product[] }) {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startEdit(p: Product) {
    setEditingId(p.id);
    const { data: existingImages } = await supabase
      .from("product_images")
      .select("image_url")
      .eq("product_id", p.id)
      .order("sort_order", { ascending: true });

    setForm({
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      sizes: (p.sizes ?? []).join(", "),
      stock: String(p.stock),
      image_url: p.image_url ?? "",
      category: p.category ?? "",
      is_category_image: p.is_category_image ?? false,
      extraImages: (existingImages ?? []).map((row) => row.image_url),
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
      if (error) {
        setSaving(false);
        setError(error.message);
        return;
      }

      const galleryError = await saveGalleryImages(editingId, form.extraImages);
      setSaving(false);
      if (galleryError) {
        setError(galleryError);
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
      if (error) {
        setSaving(false);
        setError(error.message);
        return;
      }

      const galleryError = await saveGalleryImages(data.id, form.extraImages);
      setSaving(false);
      if (galleryError) {
        setError(galleryError);
        return;
      }

      setProducts((prev) => [data as Product, ...prev]);
      resetForm();
    }
  }

  // Replaces every gallery image for this product with the current list in
  // the form — simplest way to handle adds, removes, and reordering at once.
  async function saveGalleryImages(productId: string, urls: string[]) {
    const { error: deleteError } = await supabase
      .from("product_images")
      .delete()
      .eq("product_id", productId);
    if (deleteError) return deleteError.message;

    const validUrls = urls.map((u) => u.trim()).filter(Boolean);
    if (validUrls.length === 0) return null;

    const { error: insertError } = await supabase.from("product_images").insert(
      validUrls.map((url, i) => ({
        product_id: productId,
        image_url: url,
        sort_order: i,
      }))
    );
    return insertError ? insertError.message : null;
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
            public URL here, or use any hosted image link. This is the main
            photo shown on cards and everywhere else on the site.
          </p>
        </div>

        <div>
          <label className="label">Additional photos (optional)</label>
          {form.extraImages.map((url, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                className="input"
                placeholder="https://…"
                value={url}
                onChange={(e) => {
                  const next = [...form.extraImages];
                  next[i] = e.target.value;
                  setForm({ ...form, extraImages: next });
                }}
              />
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    extraImages: form.extraImages.filter((_, idx) => idx !== i),
                  })
                }
                className="btn-secondary shrink-0"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setForm({ ...form, extraImages: [...form.extraImages, ""] })}
            className="btn-secondary w-full"
          >
            + Add another photo
          </button>
          <p className="mt-1 text-xs text-ink/50">
            These show as extra photos in the gallery on the product page.
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
