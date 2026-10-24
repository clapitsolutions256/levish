import { createApi } from "@reduxjs/toolkit/query/react";
import type { ColorGallery, Product, ProductVariant } from "@/types";
import { adminBaseQuery } from "./baseQuery";

export type AdminSession = {
  email: string;
  name: string;
};

export type AdminLoginResponse = {
  token: string;
  admin: AdminSession;
};

export type Banner = {
  id: string;
  image: string;
  mobileImage: string;
  alt: string;
  href: string;
  sortOrder: number;
  active: boolean;
};

export type BannerInput = {
  image: string;
  mobileImage?: string;
  alt?: string;
  href?: string;
  sortOrder?: number;
  active?: boolean;
};

export type ProductPayload = {
  name: string;
  price: number;
  compareAtPrice: string;
  categoryId: string;
  subcategory: string;
  brand: string;
  color: string;
  variants: ProductVariant[];
  colorImages: ColorGallery[];
  description: string;
  image: string;
  images: string[];
  featured: boolean;
  new: boolean;
  active: boolean;
};

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: adminBaseQuery,
  tagTypes: ["AdminProduct", "AdminSession", "AdminBanner", "AdminBrand"],
  refetchOnFocus: true,
  refetchOnReconnect: true,
  keepUnusedDataFor: 120,
  endpoints: (builder) => ({
    adminLogin: builder.mutation<AdminLoginResponse, { email: string; password: string }>({
      query: (body) => ({ url: "/admin/login", method: "POST", body }),
    }),
    adminMe: builder.query<AdminSession, void>({
      query: () => "/admin/me",
      providesTags: ["AdminSession"],
    }),
    getAdminProducts: builder.query<Product[], { category?: string; search?: string }>({
      query: ({ category, search } = {}) => {
        const params = new URLSearchParams();
        if (category && category !== "all") params.set("category", category);
        if (search) params.set("search", search);
        const query = params.toString();
        return `/admin/products${query ? `?${query}` : ""}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((product) => ({ type: "AdminProduct" as const, id: product.id })),
              { type: "AdminProduct" as const, id: "LIST" },
            ]
          : [{ type: "AdminProduct" as const, id: "LIST" }],
    }),
    createProduct: builder.mutation<{ id: string }, ProductPayload>({
      query: (body) => ({ url: "/admin/products", method: "POST", body }),
      invalidatesTags: [{ type: "AdminProduct", id: "LIST" }, { type: "AdminBrand", id: "LIST" }],
    }),
    updateProduct: builder.mutation<{ ok: boolean }, { id: string; body: ProductPayload }>({
      query: ({ id, body }) => ({ url: `/admin/products/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "AdminProduct", id },
        { type: "AdminProduct", id: "LIST" },
        { type: "AdminBrand", id: "LIST" },
      ],
    }),
    deleteProduct: builder.mutation<{ ok: boolean }, string>({
      query: (id) => ({ url: `/admin/products/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "AdminProduct", id },
        { type: "AdminProduct", id: "LIST" },
      ],
    }),
    markProductSold: builder.mutation<{ ok: boolean }, string>({
      query: (id) => ({ url: `/admin/products/${id}/sold`, method: "POST" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "AdminProduct", id },
        { type: "AdminProduct", id: "LIST" },
      ],
    }),
    setProductSale: builder.mutation<{ ok: boolean }, { id: string; percent: number }>({
      query: ({ id, percent }) => ({ url: `/admin/products/${id}/sale`, method: "POST", body: { percent } }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "AdminProduct", id },
        { type: "AdminProduct", id: "LIST" },
      ],
    }),
    uploadProductImages: builder.mutation<{ url?: string; urls: string[] }, FormData>({
      query: (body) => ({ url: "/admin/products/image", method: "POST", body }),
    }),
    getAdminBrands: builder.query<{ slug: string; name: string }[], void>({
      query: () => "/admin/brands",
      providesTags: [{ type: "AdminBrand", id: "LIST" }],
    }),
    createBrand: builder.mutation<{ ok: boolean }, { name: string }>({
      query: (body) => ({ url: "/admin/brands", method: "POST", body }),
      invalidatesTags: [{ type: "AdminBrand", id: "LIST" }],
    }),
    getBanners: builder.query<Banner[], void>({
      query: () => "/admin/banners",
      providesTags: (result) =>
        result
          ? [
              ...result.map((banner) => ({ type: "AdminBanner" as const, id: banner.id })),
              { type: "AdminBanner" as const, id: "LIST" },
            ]
          : [{ type: "AdminBanner" as const, id: "LIST" }],
    }),
    createBanner: builder.mutation<{ id: string }, BannerInput>({
      query: (body) => ({ url: "/admin/banners", method: "POST", body }),
      invalidatesTags: [{ type: "AdminBanner", id: "LIST" }],
    }),
    updateBanner: builder.mutation<{ ok: boolean }, { id: string; body: Partial<BannerInput> }>({
      query: ({ id, body }) => ({ url: `/admin/banners/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "AdminBanner", id },
        { type: "AdminBanner", id: "LIST" },
      ],
    }),
    deleteBanner: builder.mutation<{ ok: boolean }, string>({
      query: (id) => ({ url: `/admin/banners/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "AdminBanner", id: "LIST" }],
    }),
    uploadBannerImage: builder.mutation<{ url: string }, FormData>({
      query: (body) => ({ url: "/admin/banners/image", method: "POST", body }),
    }),
  }),
});

export const {
  useAdminLoginMutation,
  useLazyAdminMeQuery,
  useGetAdminProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useMarkProductSoldMutation,
  useSetProductSaleMutation,
  useUploadProductImagesMutation,
  useGetAdminBrandsQuery,
  useCreateBrandMutation,
  useGetBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useUploadBannerImageMutation,
} = adminApi;
