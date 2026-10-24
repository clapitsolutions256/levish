import { createApi } from "@reduxjs/toolkit/query/react";
import { customerBaseQuery } from "./baseQuery";

export type AccountOrder = {
  _id: string;
  status: string;
  subtotal: number;
  shipping: string;
  total: number;
  createdAt: string;
  orderItems: {
    name: string;
    quantity: number;
    price: number;
    variant?: string;
    size?: string;
    image?: string;
  }[];
};

export type AccountUser = {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
};

export type AccountResponse = {
  user: AccountUser;
  orders: AccountOrder[];
};

export type AccountDetails = {
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
};

export const accountApi = createApi({
  reducerPath: "accountApi",
  baseQuery: customerBaseQuery,
  tagTypes: ["Account"],
  refetchOnFocus: true,
  refetchOnReconnect: true,
  keepUnusedDataFor: 120,
  endpoints: (builder) => ({
    getAccount: builder.query<AccountResponse, void>({
      query: () => "/account",
      providesTags: ["Account"],
    }),
    updateAccount: builder.mutation<{ user: { name: string } }, AccountDetails>({
      query: (body) => ({ url: "/account", method: "PATCH", body }),
      invalidatesTags: ["Account"],
    }),
    changePassword: builder.mutation<{ message: string }, { currentPassword: string; newPassword: string }>({
      query: (body) => ({ url: "/account/password", method: "PATCH", body }),
    }),
  }),
});

export const { useGetAccountQuery, useUpdateAccountMutation, useChangePasswordMutation } = accountApi;
