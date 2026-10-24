import { createApi } from "@reduxjs/toolkit/query/react";
import { publicBaseQuery } from "./baseQuery";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export type AuthResponse = {
  token?: string;
  user?: AuthUser;
  message?: string;
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: publicBaseQuery,
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    signup: builder.mutation<AuthResponse, { name: string; email: string; password: string }>({
      query: (body) => ({ url: "/auth/signup", method: "POST", body }),
    }),
    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
    }),
    resetPassword: builder.mutation<AuthResponse, { token: string; password: string }>({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
