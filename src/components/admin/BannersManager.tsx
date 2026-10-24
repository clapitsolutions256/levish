"use client";

import { useState } from "react";
import Image from "next/image";
import { apiError } from "@/store/apiError";
import {
  useCreateBannerMutation,
  useDeleteBannerMutation,
  useGetBannersQuery,
  useUpdateBannerMutation,
  useUploadBannerImageMutation,
  type Banner,
} from "@/store/adminApi";

const emptyForm = { image: "", mobileImage: "", alt: "", href: "", active: true };

export function BannersManager() {
  const { data: banners = [], isLoading, error } = useGetBannersQuery();
  const [createBanner, { isLoading: creating }] = useCreateBannerMutation();
  const [updateBanner] = useUpdateBannerMutation();
  const [deleteBanner] = useDeleteBannerMutation();
  const [uploadBannerImage] = useUploadBannerImageMutation();
  const [uploadingField, setUploadingField] = useState<"image" | "mobileImage" | "">("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  function startCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setOpen(true);
  }

  function startEdit(banner: Banner) {
    setEditing(banner);
    setForm({
      image: banner.image,
      mobileImage: banner.mobileImage,
      alt: banner.alt,
      href: banner.href,
      active: banner.active,
    });
    setFormError("");
    setOpen(true);
  }

  async function upload(file: File | undefined, field: "image" | "mobileImage") {
    if (!file) return;
    setFormError("");
    setUploadingField(field);
    const body = new FormData();
    body.append("file", file);
    try {
      const data = await uploadBannerImage(body).unwrap();
      setForm((current) => ({ ...current, [field]: data.url }));
    } catch (err) {
      setFormError(apiError(err, "Could not upload the image."));
    } finally {
      setUploadingField("");
    }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");
    try {
      if (editing) {
        await updateBanner({ id: editing.id, body: form }).unwrap();
      } else {
        await createBanner(form).unwrap();
      }
      setOpen(false);
    } catch (err) {
      setFormError(apiError(err, "Could not save the banner."));
    }
  }

  async function move(banner: Banner, direction: -1 | 1) {
    const ordered = [...banners].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
    const index = ordered.findIndex((item) => item.id === banner.id);
    const neighbor = ordered[index + direction];
    if (!neighbor) return;
    await updateBanner({ id: banner.id, body: { sortOrder: neighbor.sortOrder } });
    await updateBanner({ id: neighbor.id, body: { sortOrder: banner.sortOrder } });
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Banners</h1>
          <p className="mt-1 text-sm text-gray-500">Each banner has a web picture and a mobile picture. Phones show the mobile one.</p>
        </div>
        <button type="button" onClick={startCreate} className="px-4 py-2.5 rounded-lg bg-[#4a142a] text-white text-sm font-semibold hover:bg-[#350e1e]">
          Add banner
        </button>
      </div>

      {error ? <p className="mb-4 text-sm text-red-700">Could not load banners.</p> : null}

      <div className="space-y-3">
        {isLoading ? <p className="text-sm text-gray-500">Loading banners…</p> : null}
        {!isLoading && banners.length === 0 ? (
          <p className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500">No banners yet. The homepage keeps the current picture until you add one.</p>
        ) : null}
        {banners.map((banner, index) => (
          <article key={banner.id} className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <Preview label="Web" url={banner.image} wide />
              <Preview label="Mobile" url={banner.mobileImage} wide={false} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{banner.alt || "Empulse banner"}</p>
                <p className="mt-1 truncate text-xs text-gray-500">{banner.href || "No link"}</p>
                <p className="mt-1 text-xs text-gray-400">{banner.active ? "Showing on the site" : "Hidden"}</p>
                {!banner.mobileImage ? <p className="mt-1 text-xs text-amber-700">No mobile picture yet. Phones are using the web picture.</p> : null}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => move(banner, -1)} disabled={index === 0} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium disabled:opacity-40">
                Up
              </button>
              <button type="button" onClick={() => move(banner, 1)} disabled={index === banners.length - 1} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium disabled:opacity-40">
                Down
              </button>
              <button
                type="button"
                onClick={() => updateBanner({ id: banner.id, body: { active: !banner.active } })}
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium"
              >
                {banner.active ? "Hide" : "Show"}
              </button>
              <button type="button" onClick={() => startEdit(banner)} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium">
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Delete this banner?")) deleteBanner(banner.id);
                }}
                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={save} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">{editing ? "Edit banner" : "Add banner"}</h2>
            <p className="mt-1 text-sm text-gray-500">Upload one picture for computers and a different picture for phones.</p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ImageField
                label="Web banner"
                hint="Wide picture for laptops"
                url={form.image}
                wide
                uploading={uploadingField === "image"}
                onFile={(file) => upload(file, "image")}
              />
              <ImageField
                label="Mobile banner"
                hint="Tall picture for phones"
                url={form.mobileImage}
                wide={false}
                uploading={uploadingField === "mobileImage"}
                onFile={(file) => upload(file, "mobileImage")}
                onClear={form.mobileImage ? () => setForm((current) => ({ ...current, mobileImage: "" })) : undefined}
              />
            </div>

            <label className="mt-4 block text-sm font-medium text-gray-700">
              Description
              <input
                value={form.alt}
                onChange={(event) => setForm({ ...form, alt: event.target.value })}
                placeholder="Empulse new arrivals"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
              />
            </label>
            <label className="mt-4 block text-sm font-medium text-gray-700">
              Link (optional)
              <input
                value={form.href}
                onChange={(event) => setForm({ ...form, href: event.target.value })}
                placeholder="/shoes or https://..."
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
              />
            </label>
            <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
              Show on the homepage
            </label>
            {formError ? <p className="mt-3 text-sm text-red-700">{formError}</p> : null}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium">
                Cancel
              </button>
              <button type="submit" disabled={creating || Boolean(uploadingField) || !form.image} className="rounded-lg bg-[#4a142a] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                {creating ? "Saving…" : "Save banner"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function Preview({ label, url, wide }: { label: string; url: string; wide: boolean }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <div className={`relative overflow-hidden rounded-xl bg-gray-100 ${wide ? "h-24 w-40 sm:w-56" : "h-24 w-16"}`}>
        {url ? <Image src={url} alt="" fill className="object-cover" sizes="224px" /> : <span className="absolute inset-0 flex items-center justify-center px-1 text-center text-[10px] text-gray-400">Not set</span>}
      </div>
    </div>
  );
}

function ImageField({
  label,
  hint,
  url,
  wide,
  uploading,
  onFile,
  onClear,
}: {
  label: string;
  hint: string;
  url: string;
  wide: boolean;
  uploading: boolean;
  onFile: (file: File | undefined) => void;
  onClear?: () => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-xs text-gray-500">{hint}</p>
      <div className={`relative mt-2 overflow-hidden rounded-xl bg-gray-100 ${wide ? "aspect-[2029/775]" : "mx-auto aspect-[1122/1402] w-28"}`}>
        {url ? <Image src={url} alt="" fill className="object-cover" sizes="320px" /> : <span className="absolute inset-0 flex items-center justify-center px-3 text-center text-xs text-gray-400">No picture yet</span>}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <label className="inline-flex cursor-pointer rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700">
          {uploading ? "Uploading…" : url ? "Replace" : "Upload"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => {
              onFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
        {onClear ? (
          <button type="button" onClick={onClear} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700">
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}
