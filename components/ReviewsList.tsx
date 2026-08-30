type Review = {
  id: string;
  rating: number;
  comment: string | null;
  media_urls: string[];
  created_at: string;
  customer_name: string | null;
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-thread">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={rating >= star ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 2.5l2.9 6.2 6.8.7-5 4.7 1.3 6.7L12 17.4l-6 3.4 1.3-6.7-5-4.7 6.8-.7L12 2.5z" />
        </svg>
      ))}
    </div>
  );
}

function isVideo(url: string) {
  return /\.(mp4|mov|webm|m4v)$/i.test(url);
}

export default function ReviewsList({ reviews }: { reviews: Review[] }) {
  const count = reviews.length;
  const average =
    count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Stars rating={Math.round(average)} />
        <p className="text-sm text-ink/70">
          {count > 0
            ? `${average.toFixed(1)} out of 5 · ${count} review${count === 1 ? "" : "s"}`
            : "No reviews yet"}
        </p>
      </div>

      {count === 0 && (
        <p className="text-sm text-ink/50">
          Be the first to review this product.
        </p>
      )}

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-line pb-6">
            <div className="flex items-center justify-between mb-1">
              <Stars rating={review.rating} />
              <p className="text-xs text-ink/40">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
            <p className="text-sm font-medium mb-1">
              {review.customer_name || "Verified buyer"}
            </p>
            {review.comment && (
              <p className="text-sm text-ink/70 mb-3">{review.comment}</p>
            )}
            {review.media_urls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {review.media_urls.map((url, i) =>
                  isVideo(url) ? (
                    <video
                      key={i}
                      src={url}
                      controls
                      className="h-24 w-24 object-cover rounded bg-line/40"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={url}
                      alt="Review photo"
                      className="h-24 w-24 object-cover rounded bg-line/40"
                    />
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
