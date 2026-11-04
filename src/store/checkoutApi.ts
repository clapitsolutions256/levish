import { createApi } from "@reduxjs/toolkit/query/react";
import { customerBaseQuery } from "./baseQuery";

interface OrderItem {
  productId?: string;
  name: string;
  variant: string;
  color?: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
}

interface CheckoutRequest {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  state?: string;
  postalCode?: string;
  phone: string;
  orderItems: OrderItem[];
  subtotal: number;
  shipping: string;
  total: number;
  paymentMethod: string;
  promoCode?: string;
}

interface CheckoutResponse {
  message: string;
  orderId: string;
  total: number;
}

export interface AppliedPromo {
  code: string;
  type: "percent" | "fixed";
  value: number;
  discount: number;
}

export interface Order {
  _id: string;
  contact: { email: string };
  deliveryAddress: {
    firstName: string;
    lastName: string;
    address: string;
    apartment?: string;
    city: string;
    state?: string;
    postalCode?: string;
    phone: string;
  };
  orderItems: OrderItem[];
  subtotal: number;
  shipping: string;
  total: number;
  discount?: number;
  promoCode?: string;
  paymentMethod?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export const checkoutApi = createApi({
  reducerPath: "checkoutApi",
  baseQuery: customerBaseQuery,
  tagTypes: ["Order"],
  refetchOnFocus: true,
  refetchOnReconnect: true,
  keepUnusedDataFor: 120,
  endpoints: (builder) => ({
    placeOrder: builder.mutation<CheckoutResponse, CheckoutRequest>({
      query: (order) => ({
        url: "/checkout",
        method: "POST",
        body: order,
      }),
      invalidatesTags: ["Order"],
    }),
    applyPromo: builder.mutation<
      AppliedPromo,
      { code: string; email: string; phone: string; orderItems: { productId?: string; quantity: number }[] }
    >({
      query: (body) => ({ url: "/promo", method: "POST", body }),
    }),
    getOrder: builder.query<Order, string>({
      query: (id) => `/checkout/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Order", id }],
    }),
  }),
});

export const { usePlaceOrderMutation, useApplyPromoMutation, useGetOrderQuery } = checkoutApi;
