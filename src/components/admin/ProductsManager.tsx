"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { productCategories } from "@/data/productCategories";
import type { ColorGallery, Product } from "@/types";
import { isSold, totalStock } from "@/lib/variants";
import { MAX_SALE_PERCENT, salePrice } from "@/lib/sale";
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useMarkProductSoldMutation,
  useGetAdminBrandsQuery,
  useGetAdminProductsQuery,
  useSetProductSaleMutation,
  useUpdateProductMutation,
  useUploadProductImagesMutation,
  type ProductPayload,
} from "@/store/adminApi";
import { apiError } from "@/store/apiError";
import { Skeleton } from "@/components/Skeleton";
import { Spinner } from "@/components/Spinner";

type DraftVariant = { size: string; color: string; stock: string };

type Draft = {
  name: string;
  price: string;
  compareAtPrice: string;
  categoryId: string;
  subcategory: string;
  brand: string;
  color: string;
  variants: DraftVariant[];
  colorImages: ColorGallery[];
  description: string;
  image: string;
  images: string[];
  featured: boolean;
  new: boolean;
  active: boolean;
};

const NEW_BRAND = "__new_brand__";
const NEW_TYPE = "__new_type__";

const waistSizes = ["28", "30", "32", "34", "36", "38", "40", "42"];
const shoeSizes = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"];

function sizeGuide(categoryId: string) {
  if (categoryId === "shoes") {
    return {
      label: "Shoe size",
      sizes: shoeSizes,
      hint: "Shoes use 40, 41, 42 and so on. Tap a size or type another number.",
    };
  }
  if (categoryId === "women" || categoryId === "men" || categoryId === "unisex" || categoryId === "belts") {
    return {
      label: "Waist",
      sizes: waistSizes,
      hint: "Dresses, jackets and other clothes use waist sizes such as 30, 32, 34. Tap a size or type another one.",
    };
  }
  return {
    label: "Size",
    sizes: [] as string[],
    hint: "Type the size you want to add.",
  };
}

const emptyDraft: Draft = {
  name: "",
  price: "",
  compareAtPrice: "",
  categoryId: "women",
  subcategory: "",
  brand: "",
  color: "",
  variants: [],
  colorImages: [],
  description: "",
  image: "",
  images: [],
  featured: false,
  new: true,
  active: true,
};

export function ProductsManager() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [formError, setFormError] = useState("");
  const [customSize, setCustomSize] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [sizeError, setSizeError] = useState("");
  const [palette, setPalette] = useState<string[]>([]);
  const [typingBrand, setTypingBrand] = useState(false);
  const [typingType, setTypingType] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [soldId, setSoldId] = useState<string | null>(null);
  const [saleProduct, setSaleProduct] = useState<Product | null>(null);
  const [saleInput, setSaleInput] = useState("");
  const [saleError, setSaleError] = useState("");
  const [listError, setListError] = useState("");
  const { data, isLoading: loading, isFetching, error: loadError } = useGetAdminProductsQuery({
    category,
    search: debouncedSearch,
  });
  const products = data ?? [];
  const error = loadError ? apiError(loadError, "Could not load products.") : "";
  const [createProduct, { isLoading: creatingProduct }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updatingProduct }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();
  const [markProductSold, { isLoading: markingSold }] = useMarkProductSoldMutation();
  const [setProductSale, { isLoading: savingSale }] = useSetProductSaleMutation();
  const [uploadImagesRequest, { isLoading: uploading }] = useUploadProductImagesMutation();
  const [uploadingColor, setUploadingColor] = useState("");
  const saving = creatingProduct || updatingProduct;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Built-in types for the category, plus custom types already used on products in it.
  const typeOptionsFor = useCallback(
    (categoryId: string) => {
      const builtIn = productCategories.find((item) => item.id === categoryId)?.subcategories ?? [];
      const used = (data ?? []).filter((product) => product.categoryId === categoryId).map((product) => product.subcategory?.trim() ?? "");
      const seen = new Set<string>();
      return [...builtIn, ...used].filter((item) => {
        const key = item.toLowerCase();
        if (!item || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    },
    [data]
  );
  const subcategoryOptions = useMemo(() => {
    const options = typeOptionsFor(draft.categoryId);
    const current = draft.subcategory.trim();
    return current && !options.some((item) => item.toLowerCase() === current.toLowerCase()) ? [...options, current] : options;
  }, [typeOptionsFor, draft.categoryId, draft.subcategory]);
  const sizes = useMemo(() => sizeGuide(draft.categoryId), [draft.categoryId]);
  const { data: savedBrands } = useGetAdminBrandsQuery();
  const brandOptions = useMemo(
    () =>
      [...new Set([...(savedBrands ?? []).map((brand) => brand.name), ...(data ?? []).map((product) => product.brand?.trim() ?? "")].filter(Boolean))].sort(),
    [savedBrands, data]
  );

  function sameOption(variant: DraftVariant, size: string, color: string) {
    return variant.size.trim().toLowerCase() === size.trim().toLowerCase() && variant.color.trim().toLowerCase() === color.trim().toLowerCase();
  }

  function addColor(raw: string) {
    const color = raw.trim().replace(/\s+/g, " ");
    if (!color) return;
    if (palette.some((item) => item.toLowerCase() === color.toLowerCase())) {
      setColorInput("");
      return;
    }
    setFormError("");
    setSizeError("");
    setPalette((current) => [...current, color]);
    setDraft((current) => {
      const sizes = [...new Set(current.variants.map((variant) => variant.size.trim()).filter(Boolean))];
      const variants = [...current.variants];
      for (const size of sizes) {
        if (!variants.some((variant) => sameOption(variant, size, color))) {
          variants.push({ size, color, stock: "1" });
        }
      }
      const colorImages = current.colorImages.some((item) => item.color.toLowerCase() === color.toLowerCase())
        ? current.colorImages
        : [...current.colorImages, { color, images: [] }];
      return { ...current, color: [...palette, color].join(" / "), variants, colorImages };
    });
    setColorInput("");
  }

  function removeColor(color: string) {
    const nextPalette = palette.filter((item) => item.toLowerCase() !== color.toLowerCase());
    setPalette(nextPalette);
    setDraft((current) => ({
      ...current,
      color: nextPalette.join(" / "),
      variants: current.variants.filter((variant) => variant.color.trim().toLowerCase() !== color.toLowerCase()),
      colorImages: current.colorImages.filter((item) => item.color.toLowerCase() !== color.toLowerCase()),
    }));
  }

  function colorPhotos(color: string) {
    return draft.colorImages.find((item) => item.color.toLowerCase() === color.toLowerCase())?.images ?? [];
  }

  function updateColorPhotos(color: string, images: string[]) {
    setDraft((current) => {
      const next = images.slice(0, 8);
      const exists = current.colorImages.some((item) => item.color.toLowerCase() === color.toLowerCase());
      const colorImages = exists
        ? current.colorImages.map((item) => (item.color.toLowerCase() === color.toLowerCase() ? { ...item, images: next } : item))
        : [...current.colorImages, { color, images: next }];
      return { ...current, colorImages };
    });
  }

  async function uploadColorImages(color: string, files: File[]) {
    if (!files.length) return;
    setFormError("");
    setUploadingColor(color);
    try {
      const body = new FormData();
      files.forEach((file) => body.append("file", file));
      const data = await uploadImagesRequest(body).unwrap();
      const urls = data.urls ?? [];
      setDraft((current) => {
        const existing = current.colorImages.find((item) => item.color.toLowerCase() === color.toLowerCase())?.images ?? [];
        const images = [...existing, ...urls].slice(0, 8);
        const colorImages = current.colorImages.some((item) => item.color.toLowerCase() === color.toLowerCase())
          ? current.colorImages.map((item) => (item.color.toLowerCase() === color.toLowerCase() ? { ...item, images } : item))
          : [...current.colorImages, { color, images }];
        return { ...current, colorImages };
      });
    } catch (err) {
      setFormError(apiError(err, "Could not upload the images."));
    } finally {
      setUploadingColor("");
    }
  }

  function addVariantSize(size: string) {
    const next = size.trim();
    if (!next) return;
    // A color typed in the box but not added yet is added first, so the size has a color to go with.
    const typedColor = colorInput.trim().replace(/\s+/g, " ");
    const colors = palette.length ? palette : typedColor ? [typedColor] : [];
    if (!colors.length) {
      setSizeError("Add a color first (e.g. Black, Blue), then tap a size. Each size gets its own stock per color.");
      return;
    }
    if (!palette.length) addColor(typedColor);
    setSizeError("");
    setFormError("");
    setDraft((current) => {
      const variants = [...current.variants];
      for (const color of colors) {
        if (!variants.some((variant) => sameOption(variant, next, color))) {
          variants.push({ size: next, color, stock: "1" });
        }
      }
      return { ...current, variants };
    });
    setCustomSize("");
  }

  function setVariantStock(size: string, color: string, stock: string) {
    setDraft((current) => ({
      ...current,
      variants: current.variants.map((variant) => (sameOption(variant, size, color) ? { ...variant, stock } : variant)),
    }));
  }

  function removeVariant(size: string, color: string) {
    setDraft((current) => ({
      ...current,
      variants: current.variants.filter((variant) => !sameOption(variant, size, color)),
    }));
  }

  function openCreate() {
    setEditing(null);
    setDraft(emptyDraft);
    setPalette([]);
    setColorInput("");
    setCustomSize("");
    setFormError("");
    setTypingBrand(false);
    setTypingType(false);
    setCreating(true);
  }

  function openEdit(product: Product) {
    setCreating(false);
    setEditing(product);
    setTypingBrand(false);
    setTypingType(false);
    setCustomSize("");
    setColorInput("");
    setFormError("");
    const variantColors = [...new Set((product.variants ?? []).map((variant) => variant.color.trim()).filter(Boolean))];
    const savedColors = product.color && product.color !== "—" ? product.color.split("/").map((item) => item.trim()).filter(Boolean) : [];
    setPalette(variantColors.length ? variantColors : savedColors);
    setDraft({
      name: product.name,
      price: String(product.price),
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
      categoryId: product.categoryId,
      subcategory: product.subcategory ?? "",
      brand: product.brand ?? "",
      color: product.color === "—" ? "" : product.color,
      variants: (product.variants ?? []).map((variant) => ({
        size: variant.size,
        color: variant.color,
        stock: String(variant.stock),
      })),
      colorImages: product.colorImages ?? [],
      description: product.description ?? "",
      image: product.image,
      images: product.images?.length ? product.images : [product.image],
      featured: Boolean(product.featured),
      new: Boolean(product.new),
      active: product.active !== false,
    });
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
    setSizeError("");
  }

  async function uploadImages(files: File[]) {
    if (!files.length) return;
    setFormError("");
    try {
      const body = new FormData();
      files.forEach((file) => body.append("file", file));
      const data = await uploadImagesRequest(body).unwrap();
      const urls = data.urls ?? [];
      setDraft((current) => {
        const images = [...current.images, ...urls].slice(0, 8);
        return { ...current, images, image: images[0] ?? "" };
      });
    } catch (err) {
      setFormError(apiError(err, "Could not upload the images."));
    }
  }

  function addImageUrl(url: string) {
    const next = url.trim();
    if (!next) return;
    setDraft((current) => {
      const images = [...current.images, next].slice(0, 8);
      return { ...current, images, image: images[0] ?? "" };
    });
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");
    const payload: ProductPayload = {
      ...draft,
      price: Number(draft.price),
      compareAtPrice: draft.compareAtPrice,
      color: palette.join(" / "),
      variants: draft.variants
        .map((variant) => ({
          size: variant.size.trim(),
          color: variant.color.trim(),
          stock: Math.max(0, Math.floor(Number(variant.stock) || 0)),
        }))
        .filter((variant) => variant.size && variant.color),
      colorImages: palette
        .map((color) => ({
          color,
          images: (draft.colorImages.find((item) => item.color.toLowerCase() === color.toLowerCase())?.images ?? []).slice(0, 8),
        }))
        .filter((item) => item.images.length),
    };
    try {
      if (editing) await updateProduct({ id: editing.id, body: payload }).unwrap();
      else await createProduct(payload).unwrap();
      closeForm();
    } catch (err) {
      setFormError(apiError(err, "Could not save the product."));
    }
  }

  async function remove(id: string) {
    setListError("");
    try {
      await deleteProduct(id).unwrap();
      setDeleteId(null);
    } catch (err) {
      setListError(apiError(err, "Could not delete the product."));
    }
  }

  async function markSold(id: string) {
    setListError("");
    try {
      await markProductSold(id).unwrap();
      setSoldId(null);
    } catch (err) {
      setListError(apiError(err, "Could not mark the product as sold."));
    }
  }

  function openSale(product: Product) {
    setSaleProduct(product);
    setSaleInput(product.salePercent ? String(product.salePercent) : "");
    setSaleError("");
  }

  async function saveSale(percent: number) {
    if (!saleProduct) return;
    if (!Number.isInteger(percent) || percent < 0 || percent > MAX_SALE_PERCENT) {
      setSaleError(`Enter a whole number from 1 to ${MAX_SALE_PERCENT}.`);
      return;
    }
    try {
      await setProductSale({ id: saleProduct.id, percent }).unwrap();
      setSaleProduct(null);
    } catch (err) {
      setSaleError(apiError(err, "Could not update the sale."));
    }
  }

  const salePercentDraft = Number(saleInput);
  const salePreview =
    saleProduct && Number.isInteger(salePercentDraft) && salePercentDraft > 0 && salePercentDraft <= MAX_SALE_PERCENT
      ? salePrice(saleProduct.price, salePercentDraft)
      : null;

  const formOpen = creating || Boolean(editing);

  useEffect(() => {
    if (!formOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeForm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [formOpen]);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Add and update the store catalog by category</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2.5 rounded-lg bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-hover)]"
        >
          Add product
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={`shrink-0 px-3 py-2 rounded-lg text-xs font-semibold ${category === "all" ? "bg-[var(--accent)] text-white" : "bg-white border border-gray-200 text-gray-600"}`}
        >
          All
        </button>
        {productCategories.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCategory(item.id)}
            className={`shrink-0 px-3 py-2 rounded-lg text-xs font-semibold ${category === item.id ? "bg-[var(--accent)] text-white" : "bg-white border border-gray-200 text-gray-600"}`}
          >
            {item.name}
          </button>
        ))}
      </div>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by name, color, or type"
        className="mb-4 w-full max-w-md px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm"
      />

      {error ? <p className="mb-4 text-sm text-red-700">{error}</p> : null}
      {listError ? <p className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{listError}</p> : null}

      <div className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {isFetching && !loading ? (
          <div className="absolute right-3 top-3 z-10 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs text-gray-500 shadow-sm">
            <Spinner className="h-3.5 w-3.5" /> Updating…
          </div>
        ) : null}
        {loading ? (
          <div aria-busy="true" aria-label="Loading products">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="flex items-center gap-3 border-t border-gray-100 px-4 py-3 first:border-t-0">
                <Skeleton className="h-14 w-11 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-1/3 rounded" />
                  <Skeleton className="mt-2 h-3 w-1/4 rounded" />
                </div>
                <Skeleton className="hidden h-4 w-20 rounded sm:block" />
                <Skeleton className="hidden h-4 w-12 rounded md:block" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="p-8 text-sm text-gray-500">No products in this category yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-11 overflow-hidden rounded-lg bg-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={product.image} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.brand ? `${product.brand} · ` : ""}{product.color}{product.subcategory ? ` · ${product.subcategory}` : ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {productCategories.find((item) => item.id === product.categoryId)?.name ?? product.categoryId}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {product.salePercent ? (
                        <>
                          <span className="block">Rs. {salePrice(product.price, product.salePercent).toLocaleString()}</span>
                          <span className="block text-xs font-normal text-gray-400 line-through">Rs. {Number(product.price).toLocaleString()}</span>
                        </>
                      ) : (
                        <>Rs. {Number(product.price).toLocaleString()}</>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {product.variants?.length ? totalStock(product.variants) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {product.active === false ? <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px]">Hidden</span> : <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] text-green-700">Live</span>}
                        {isSold(product) ? <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[11px] text-white">Sold</span> : null}
                        {product.salePercent ? <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] text-red-700">Sale {product.salePercent}% off</span> : null}
                        {product.new ? <span className="rounded-full bg-[var(--sage-tint)] px-2 py-0.5 text-[11px] text-[var(--accent)]">New</span> : null}
                        {product.featured ? <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-800">Featured</span> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {product.variants?.length && !isSold(product) ? (
                        soldId === product.id ? (
                          <button type="button" disabled={markingSold} onClick={() => markSold(product.id)} className="inline-flex items-center gap-1.5 text-[var(--accent)] font-semibold mr-3 disabled:opacity-60">
                            {markingSold ? <><Spinner className="h-3.5 w-3.5" /> Marking…</> : "Confirm sold"}
                          </button>
                        ) : (
                          <button type="button" onClick={() => setSoldId(product.id)} className="text-gray-700 font-medium mr-3">Mark sold</button>
                        )
                      ) : null}
                      <button type="button" onClick={() => openSale(product)} className="text-red-700 font-medium mr-3">
                        {product.salePercent ? "Edit sale" : "Sale"}
                      </button>
                      <button type="button" onClick={() => openEdit(product)} className="text-[var(--accent)] font-medium mr-3">Edit</button>
                      {deleteId === product.id ? (
                        <button type="button" disabled={deleting} onClick={() => remove(product.id)} className="inline-flex items-center gap-1.5 text-red-700 font-medium disabled:opacity-60">
                          {deleting ? <><Spinner className="h-3.5 w-3.5" /> Deleting…</> : "Confirm"}
                        </button>
                      ) : (
                        <button type="button" onClick={() => setDeleteId(product.id)} className="text-gray-500">Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {saleProduct ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={() => setSaleProduct(null)}>
          <form
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              saveSale(Number(saleInput));
            }}
          >
            <h2 className="text-lg font-semibold">Sale</h2>
            <p className="mt-1 text-sm text-gray-500">{saleProduct.name}</p>
            <p className="mt-3 text-sm text-gray-700">Original price: Rs. {Number(saleProduct.price).toLocaleString()}</p>
            <Field label="How much % off?">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={MAX_SALE_PERCENT}
                  step="1"
                  autoFocus
                  value={saleInput}
                  onChange={(event) => setSaleInput(event.target.value)}
                  placeholder="e.g. 50"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </Field>
            {salePreview != null ? (
              <p className="mt-3 text-sm">
                Sale price: <span className="font-semibold text-[var(--accent)]">Rs. {salePreview.toLocaleString()}</span>
              </p>
            ) : null}
            {saleError ? <p className="mt-3 text-sm text-red-700">{saleError}</p> : null}
            <button type="submit" disabled={savingSale || salePreview == null} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-3 font-semibold text-white disabled:opacity-50">
              {savingSale ? <><Spinner /> Saving…</> : saleProduct.salePercent ? "Update sale" : "Add sale"}
            </button>
            {saleProduct.salePercent ? (
              <button type="button" disabled={savingSale} onClick={() => saveSale(0)} className="mt-2 w-full rounded-xl border border-gray-200 py-3 text-sm font-medium text-red-700 disabled:opacity-50">
                Remove sale
              </button>
            ) : null}
            <button type="button" onClick={() => setSaleProduct(null)} className="mt-2 w-full py-2 text-sm text-gray-500">Cancel</button>
          </form>
        </div>
      ) : null}

      {formOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={closeForm}>
          <form
            onSubmit={save}
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[min(92vh,900px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold">{editing ? "Edit product" : "New product"}</h2>
              <button type="button" onClick={closeForm} className="text-sm text-gray-500">Close</button>
            </div>
            <div className="space-y-4 overflow-y-auto px-6 py-5">
              <Field label="Name">
                <input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Price (Rs.)">
                  <input required type="number" min="1" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
                </Field>
                <Field label="Compare-at price">
                  <input type="number" min="1" value={draft.compareAtPrice} onChange={(event) => setDraft({ ...draft, compareAtPrice: event.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
                </Field>
              </div>
              <Field label="Category">
                <select
                  value={draft.categoryId}
                  onChange={(event) => {
                    const categoryId = event.target.value;
                    // Keep the chosen type when the new category offers it too.
                    const kept = typeOptionsFor(categoryId).find((item) => item.toLowerCase() === draft.subcategory.trim().toLowerCase());
                    setTypingType(false);
                    setDraft({ ...draft, categoryId, subcategory: kept ?? "" });
                  }}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                >
                  {productCategories.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Type">
                {typingType ? (
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      value={draft.subcategory}
                      onChange={(event) => setDraft({ ...draft, subcategory: event.target.value.slice(0, 40) })}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter") return;
                        event.preventDefault();
                        setDraft({ ...draft, subcategory: draft.subcategory.trim().replace(/\s+/g, " ") });
                        setTypingType(false);
                      }}
                      placeholder="Custom type, e.g. Shorts"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setDraft({ ...draft, subcategory: draft.subcategory.trim().replace(/\s+/g, " ") });
                        setTypingType(false);
                      }}
                      className="shrink-0 rounded-xl bg-[var(--sage-tint)] px-3 py-2 text-sm font-medium text-[var(--accent)]"
                    >
                      Done
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDraft({ ...draft, subcategory: "" });
                        setTypingType(false);
                      }}
                      className="shrink-0 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <select
                    value={draft.subcategory}
                    onChange={(event) => {
                      if (event.target.value === NEW_TYPE) {
                        setTypingType(true);
                        setDraft({ ...draft, subcategory: "" });
                      } else setDraft({ ...draft, subcategory: event.target.value });
                    }}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                  >
                    <option value="">Any</option>
                    {subcategoryOptions.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                    <option value={NEW_TYPE}>+ Custom type…</option>
                  </select>
                )}
              </Field>
              <Field label="Brand">
                {typingBrand ? (
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      value={draft.brand}
                      onChange={(event) => setDraft({ ...draft, brand: event.target.value })}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter") return;
                        event.preventDefault();
                        setDraft({ ...draft, brand: draft.brand.trim().replace(/\s+/g, " ") });
                        setTypingBrand(false);
                      }}
                      placeholder="New brand name, e.g. Nike"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setDraft({ ...draft, brand: draft.brand.trim().replace(/\s+/g, " ") });
                        setTypingBrand(false);
                      }}
                      className="shrink-0 rounded-xl bg-[var(--sage-tint)] px-3 py-2 text-sm font-medium text-[var(--accent)]"
                    >
                      Done
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTypingBrand(false);
                        if (!brandOptions.includes(draft.brand.trim())) setDraft({ ...draft, brand: "" });
                      }}
                      className="shrink-0 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <select
                    value={draft.brand}
                    onChange={(event) => {
                      if (event.target.value === NEW_BRAND) {
                        setTypingBrand(true);
                        setDraft({ ...draft, brand: "" });
                      } else setDraft({ ...draft, brand: event.target.value });
                    }}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                  >
                    <option value="">No brand</option>
                    {[...new Set([...brandOptions, draft.brand].filter(Boolean))].map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                    <option value={NEW_BRAND}>+ New brand…</option>
                  </select>
                )}
              </Field>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Colors</span>
                  <span className="text-xs text-gray-500">
                    {draft.variants.reduce((sum, variant) => sum + Math.max(0, Math.floor(Number(variant.stock) || 0)), 0)} articles
                  </span>
                </div>
                <p className="mb-2 text-xs text-gray-500">Add every color this product comes in. The same size is kept separately in each color, with its own stock.</p>
                <div className="mb-3 flex gap-2">
                  <input
                    value={colorInput}
                    onChange={(event) => setColorInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      event.preventDefault();
                      addColor(colorInput);
                    }}
                    placeholder="Color, e.g. Black"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  />
                  <button type="button" onClick={() => addColor(colorInput)} className="shrink-0 rounded-xl bg-[var(--sage-tint)] px-3 py-2 text-sm font-medium text-[var(--accent)]">
                    Add color
                  </button>
                </div>
                {palette.length > 0 ? (
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {palette.map((color) => (
                      <span key={color} className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)] px-2.5 py-1 text-xs font-medium text-white">
                        {color}
                        <button type="button" onClick={() => removeColor(color)} className="text-white/80" aria-label={`Remove ${color}`}>
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
                <p className="mb-2 text-xs text-gray-500">{sizes.hint}</p>
                {sizes.sizes.length > 0 ? (
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {sizes.sizes.map((size) => {
                      const selected = palette.length > 0 && palette.every((color) => draft.variants.some((variant) => sameOption(variant, size, color)));
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => addVariantSize(size)}
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                            selected ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-gray-200 text-[var(--accent)]"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
                <div className="mb-3 flex gap-2">
                  <input
                    value={customSize}
                    onChange={(event) => setCustomSize(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      event.preventDefault();
                      addVariantSize(customSize);
                    }}
                    placeholder={
                      draft.categoryId === "shoes"
                        ? "Custom shoe size, e.g. 44"
                        : sizes.sizes.length
                          ? "Custom waist, e.g. 33"
                          : "Custom size"
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => addVariantSize(customSize)}
                    className="shrink-0 rounded-xl bg-[var(--sage-tint)] px-3 py-2 text-sm font-medium text-[var(--accent)]"
                  >
                    Add size
                  </button>
                </div>
                {sizeError ? <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{sizeError}</p> : null}
                <div className="space-y-3">
                  {palette.map((color) => {
                    const rows = draft.variants.filter((variant) => variant.color.trim().toLowerCase() === color.toLowerCase() && variant.size.trim());
                    return (
                      <div key={color} className="rounded-xl border border-gray-200 p-3">
                        <p className="text-sm font-semibold text-[var(--accent)]">{color}</p>
                        {rows.length === 0 ? (
                          <p className="mt-2 text-xs text-gray-500">Add a size and it will show here for this color.</p>
                        ) : (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {rows.map((variant) => (
                              <div key={`${color}-${variant.size}`} className="flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1">
                                <span className="min-w-6 text-sm font-medium">{variant.size}</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={variant.stock}
                                  aria-label={`${color} ${variant.size} stock`}
                                  onChange={(event) => setVariantStock(variant.size, color, event.target.value)}
                                  className="w-14 rounded-lg border border-gray-200 px-2 py-1 text-sm"
                                />
                                <button type="button" onClick={() => removeVariant(variant.size, color)} className="px-1 text-xs font-medium text-red-700" aria-label={`Remove ${color} ${variant.size}`}>
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="mt-3 text-xs text-gray-500">Photos for {color}. These show when a customer selects this color.</p>
                        <div className="mt-2 grid grid-cols-4 gap-2">
                          {colorPhotos(color).map((url, index) => (
                            <div key={`${color}-${url}-${index}`} className="relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt="" className="h-16 w-full rounded-lg bg-gray-100 object-cover" />
                              <button
                                type="button"
                                onClick={() => updateColorPhotos(color, colorPhotos(color).filter((_, itemIndex) => itemIndex !== index))}
                                className="absolute right-1 top-1 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-red-700"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          {uploadingColor === color ? <Skeleton className="h-16 w-full rounded-lg" /> : null}
                        </div>
                        <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-[var(--accent)]">
                          {uploadingColor === color ? <><Spinner className="h-3.5 w-3.5" /> Uploading…</> : `Upload ${color} photos`}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            className="sr-only"
                            onChange={(event) => {
                              const files = [...(event.target.files ?? [])];
                              event.target.value = "";
                              if (files.length) uploadColorImages(color, files);
                            }}
                          />
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
              <Field label="Description">
                <textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} rows={3} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
              </Field>
              <Field label="Images">
                <p className="mb-2 text-xs text-gray-500">Backup photos, used when a color does not have its own pictures. Add up to 8.</p>
                <div className="grid grid-cols-3 gap-2">
                  {draft.images.map((url, index) => (
                    <div key={`${url}-${index}`} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="h-24 w-full rounded-lg object-cover bg-gray-100" />
                      <span className="absolute left-1 top-1 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--accent)]">
                        {index === 0 ? "Cover" : index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((current) => {
                            const images = current.images.filter((_, itemIndex) => itemIndex !== index);
                            return { ...current, images, image: images[0] ?? "" };
                          })
                        }
                        className="absolute right-1 top-1 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-red-700"
                      >
                        Remove
                      </button>
                      {index > 0 ? (
                        <button
                          type="button"
                          onClick={() =>
                            setDraft((current) => {
                              const images = [...current.images];
                              const [chosen] = images.splice(index, 1);
                              images.unshift(chosen);
                              return { ...current, images, image: images[0] };
                            })
                          }
                          className="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--accent)]"
                        >
                          Make cover
                        </button>
                      ) : null}
                    </div>
                  ))}
                  {uploading && !uploadingColor ? <Skeleton className="h-24 w-full rounded-lg" /> : null}
                </div>
                <label className="mt-3 inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-[var(--accent)]">
                  {uploading && !uploadingColor ? <><Spinner className="h-3.5 w-3.5" /> Uploading…</> : "Upload images"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="sr-only"
                    onChange={(event) => {
                      const files = [...(event.target.files ?? [])];
                      event.target.value = "";
                      if (files.length) uploadImages(files);
                    }}
                  />
                </label>
                <input
                  placeholder="Or paste an image address and press Enter"
                  className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                  onKeyDown={(event) => {
                    if (event.key !== "Enter") return;
                    event.preventDefault();
                    const input = event.currentTarget;
                    addImageUrl(input.value);
                    input.value = "";
                  }}
                />
              </Field>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} /> Visible in store</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={draft.new} onChange={(event) => setDraft({ ...draft, new: event.target.checked })} /> New arrival</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={draft.featured} onChange={(event) => setDraft({ ...draft, featured: event.target.checked })} /> Featured</label>
              </div>
              {formError ? <p className="text-sm text-red-700">{formError}</p> : null}
              <button type="submit" disabled={saving || uploading} className="w-full py-3 rounded-xl bg-[var(--accent)] text-white font-semibold disabled:opacity-50">
                {saving ? <span className="inline-flex items-center gap-2"><Spinner /> Saving…</span> : "Save product"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}
