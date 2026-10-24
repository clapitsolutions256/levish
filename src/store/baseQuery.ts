import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/lib/config";
import { readCustomerSession } from "@/lib/customerSession";
import { ensureGuestToken } from "@/lib/cartToken";

export const publicBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
});

export const customerBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    if (typeof window === "undefined") return headers;
    const session = readCustomerSession();
    if (session?.token) headers.set("Authorization", `Bearer ${session.token}`);
    const cartToken = ensureGuestToken();
    if (cartToken) headers.set("x-cart-token", cartToken);
    return headers;
  },
});

export const adminBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    if (typeof window === "undefined") return headers;
    const token = localStorage.getItem("admin_token");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});
