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
}

interface CheckoutResponse {
  message: string;
  orderId: string;
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
    getOrder: builder.query<Order, string>({
      query: (id) => `/checkout/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Order", id }],
    }),
  }),
});

export const { usePlaceOrderMutation, useGetOrderQuery } = checkoutApi;
