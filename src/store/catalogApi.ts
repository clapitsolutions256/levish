import { createApi } from "@reduxjs/toolkit/query/react";
import type { Product } from "@/types";
import { publicBaseQuery } from "./baseQuery";

export const catalogApi = createApi({
  reducerPath: "catalogApi",
  baseQuery: publicBaseQuery,
  tagTypes: ["Catalog"],
  refetchOnFocus: true,
  refetchOnReconnect: true,
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({
      query: () => "/products",
      providesTags: ["Catalog"],
    }),
  }),
});

export const { useGetProductsQuery } = catalogApi;
