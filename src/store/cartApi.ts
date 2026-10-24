import { createApi } from "@reduxjs/toolkit/query/react";
import type { Product } from "@/types";
import { customerBaseQuery } from "./baseQuery";

export type CartLine = {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
};

export type CartResponse = {
  items: CartLine[];
  guestToken?: string;
};

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: customerBaseQuery,
  tagTypes: ["Cart"],
  refetchOnFocus: true,
  refetchOnReconnect: true,
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    getCart: builder.query<CartResponse, void>({
      query: () => "/cart",
      providesTags: ["Cart"],
    }),
    addCartItem: builder.mutation<CartResponse, { productId: string; quantity: number; size: string; color: string }>({
      query: (body) => ({ url: "/cart", method: "POST", body }),
      invalidatesTags: ["Cart"],
    }),
    updateCartItem: builder.mutation<CartResponse, { productId: string; quantity: number; size?: string; color?: string }>({
      query: (body) => ({ url: "/cart", method: "PATCH", body }),
      invalidatesTags: ["Cart"],
    }),
    removeCartItem: builder.mutation<CartResponse, { productId: string; size?: string; color?: string }>({
      query: (body) => ({ url: "/cart", method: "DELETE", body }),
      invalidatesTags: ["Cart"],
    }),
    clearCartItems: builder.mutation<CartResponse, void>({
      query: () => ({ url: "/cart", method: "DELETE", body: {} }),
      invalidatesTags: ["Cart"],
    }),
  }),
});
