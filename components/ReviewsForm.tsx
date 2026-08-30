"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MAX_FILES = 4;

export default function ReviewForm({
  productId,
  orderId,
}: {
  productId: string;
  orderId: string;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...selected].slice(0, MAX_FILES));
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (rating < 1) {
      setError("Please select a star rating.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to leave a review.");
        setSaving(false);
        return;
      }

      // Upload any attached photos/videos first, collecting their public URLs.
      const mediaUrls: string[] = [];
      for (const file of files) {
        const path = `${user.id}/${productId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("review-media")
          .upload(path, file);

        if (uploadError) {
          throw new Error(`Couldn't upload ${file.name}: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from("review-media")
          .getPublicUrl(path);

        mediaUrls.push(publicUrlData.publicUrl);
      }

      const { error: insertError } = await supabase.from("product_reviews").insert({
        product_id: productId,
        customer_id: user.id,
        order_id: orderId,
        rating,
        comment: comment || null,
        media_urls: mediaUrls,
      });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setDone(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong submitting your review.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="card p-5">
        <p className="text-sm text-thread">
          Thanks — your review has been posted.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4">
      <h3 className="font-medium">Write a review</h3>

      <div>
        <label className="label">Your rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={(hoverRating || rating) >= star ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-thread"
              >
                <path d="M12 2.5l2.9 6.2 6.8.7-5 4.7 1.3 6.7L12 17.4l-6 3.4 1.3-6.7-5-4.7 6.8-.7L12 2.5z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Your review (optional)</label>
        <textarea
          className="input"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="How was the fit, quality, and delivery?"
        />
      </div>

      <div>
        <label className="label">
          Add photos or a video (optional, up to {MAX_FILES})
        </label>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileChange}
          disabled={files.length >= MAX_FILES}
          className="text-sm"
        />
        {files.length > 0 && (
          <ul className="mt-2 space-y-1">
            {files.map((file, i) => (
              <li key={i} className="flex items-center justify-between text-xs text-ink/60">
                <span className="truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-red-600 ml-2 shrink-0"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Posting…" : "Post review"}
      </button>
    </form>
  );
}
