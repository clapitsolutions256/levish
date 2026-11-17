"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type ReviewableProduct = { slug: string; name: string };

const MAX_PHOTOS = 3;
const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

// Phone photos are often 5–10 MB; shrink them in the browser so the upload is quick on mobile data.
async function shrink(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    return blob ?? file;
  } catch {
    return file;
  }
}

function StarPicker({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex items-center gap-3">
      <div className="flex" role="radiogroup" aria-label="Your rating" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            className="p-0.5"
          >
            <svg className={`h-8 w-8 transition-colors ${star <= shown ? "text-[#e0a526]" : "text-[#e5e1d8]"}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10 1.5l2.6 5.3 5.9.9-4.25 4.1 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.7l5.9-.9L10 1.5z" />
            </svg>
          </button>
        ))}
      </div>
      <span className="text-sm text-[var(--muted)]">{LABELS[shown]}</span>
    </div>
  );
}

/** "Write a review" button and its pop-up. Reviews go to admin and appear once approved. */
export function WriteReview({
  product,
  products = [],
  className = "",
}: {
  /** The product being reviewed, on its own page. */
  product?: ReviewableProduct;
  /** Products to choose from when there is no fixed product (home page). */
  products?: ReviewableProduct[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState<{ file: File; url: string }[]>([]);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Previews are freed when a photo is removed, and any left over when the button goes away.
  const previews = useRef(photos);
  previews.current = photos;
  useEffect(() => () => previews.current.forEach((photo) => URL.revokeObjectURL(photo.url)), []);

  function removePhoto(photo: { file: File; url: string }) {
    URL.revokeObjectURL(photo.url);
    setPhotos((current) => current.filter((item) => item !== photo));
  }

  function reset() {
    setRating(0);
    setSlug(product?.slug ?? "");
    setText("");
    photos.forEach((photo) => URL.revokeObjectURL(photo.url));
    setPhotos([]);
    setError("");
    setSent(false);
  }

  function addPhotos(files: FileList | null) {
    if (!files) return;
    const picked = [...files].filter((file) => file.type.startsWith("image/")).slice(0, MAX_PHOTOS - photos.length);
    setPhotos((current) => [...current, ...picked.map((file) => ({ file, url: URL.createObjectURL(file) }))]);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rating) return setError("Please choose a star rating.");
    if (name.trim().length < 2) return setError("Please enter your name.");
    if (text.trim().length < 5) return setError("Please write a few words about your order.");
    setError("");
    setSending(true);
    try {
      const form = new FormData(event.currentTarget);
      form.set("rating", String(rating));
      form.set("product", slug);
      for (const [index, photo] of photos.entries()) form.append("photos", await shrink(photo.file), `photo-${index + 1}.jpg`);
      const response = await fetch("/api/reviews", { method: "POST", body: form });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not send your review. Please try again.");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your review. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const field =
    "mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3.5 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--sage-tint)]";

  const dialog = open ? (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onClick={() => setOpen(false)}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="write-review-title"
        onClick={(event) => event.stopPropagation()}
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-[1.75rem] bg-[var(--background)] p-5 shadow-2xl sm:max-w-lg sm:rounded-[1.75rem] sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="write-review-title" className="text-lg font-semibold text-[var(--foreground)]">
              Write a review
            </h2>
            {product ? <p className="mt-0.5 text-sm text-[var(--muted)]">{product.name}</p> : null}
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-2 text-[var(--muted)] hover:bg-[var(--sage-tint)]">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {sent ? (
          <div className="py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--sage-tint)] text-[var(--accent)]">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="mt-4 text-base font-semibold text-[var(--foreground)]">Thank you for your review!</p>
            <p className="mt-1 text-sm text-[var(--muted)]">It will appear on the site once our team has checked it.</p>
            <button type="button" onClick={() => setOpen(false)} className="btn-primary mt-6">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Rating</p>
              <StarPicker value={rating} onChange={setRating} />
            </div>

            {!product && products.length ? (
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Product <span className="font-normal text-[var(--muted)]">(optional)</span>
                <select value={slug} onChange={(event) => setSlug(event.target.value)} className={field}>
                  <option value="">My order in general</option>
                  {products.map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className="block text-sm font-medium text-[var(--foreground)]">
              Your review
              <textarea
                name="text"
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={4}
                maxLength={1500}
                placeholder="How was the quality, fit and delivery?"
                className={`${field} resize-none`}
              />
            </label>

            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                Photos <span className="font-normal text-[var(--muted)]">(optional, up to {MAX_PHOTOS})</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {photos.map((photo, index) => (
                  <div key={photo.url} className="relative h-20 w-20 overflow-hidden rounded-xl bg-[var(--cream)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      aria-label={`Remove photo ${index + 1}`}
                      onClick={() => removePhoto(photo)}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {photos.length < MAX_PHOTOS ? (
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[var(--border)] bg-white text-xs text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 7h3l2-3h8l2 3h3v13H3V7zm9 10a4 4 0 100-8 4 4 0 000 8z" />
                    </svg>
                    Add photo
                  </button>
                ) : null}
              </div>
              <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(event) => addPhotos(event.target.files)} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Name
                <input name="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={60} autoComplete="name" className={field} />
              </label>
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Email <span className="font-normal text-[var(--muted)]">(not shown)</span>
                <input name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={120} autoComplete="email" className={field} />
              </label>
            </div>

            {/* Left empty by people; bots that fill every field are turned away. */}
            <input name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

            {error ? <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</p> : null}

            <button type="submit" disabled={sending} className="btn-primary w-full justify-center disabled:opacity-60">
              {sending ? "Sending…" : "Submit review"}
            </button>
            <p className="text-center text-xs text-[var(--muted)]">Reviews appear after a quick check by our team.</p>
          </form>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          reset();
          setOpen(true);
        }}
        className={`inline-flex items-center justify-center gap-2 rounded-full border border-[var(--foreground)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)] hover:text-white ${className}`}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Write a review
      </button>
      {dialog ? createPortal(dialog, document.body) : null}
    </>
  );
}
