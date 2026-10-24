import { createApi } from "@reduxjs/toolkit/query/react";
import { adminBaseQuery } from "./baseQuery";

export interface OrderItem {
  name: string;
  variant: string;
  price: number;
  quantity: number;
  size?: string;
  image?: string;
}

export interface OrderNote {
  _id: string;
  text: string;
  createdAt: string;
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
  status: string;
  notes?: OrderNote[];
  createdAt: string;
  updatedAt?: string;
}

export interface OrderStats {
  totalOrders: number;
  revenue: number;
  statusCounts: Record<string, number>;
}

export interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
}

export interface CustomerDetail {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state?: string;
  postalCode?: string;
  totalOrders: number;
  totalSpent: number;
  orders: Order[];
}

export interface AnalyticsData {
  daily: { _id: string; revenue: number; orders: number }[];
  topProducts: { _id: string; totalQty: number; totalRevenue: number }[];
  topCities: { _id: string; orders: number; revenue: number }[];
}

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: adminBaseQuery,
  tagTypes: ["Order", "Stats", "Customer", "Analytics"],
  refetchOnFocus: true,
  refetchOnReconnect: true,
  keepUnusedDataFor: 120,
  endpoints: (builder) => ({
    getOrders: builder.query<Order[], { status?: string; search?: string }>({
      query: ({ status, search } = {}) => {
        const params = new URLSearchParams();
        if (status && status !== "all") params.set("status", status);
        if (search) params.set("search", search);
        return `/orders?${params.toString()}`;
      },
      providesTags: ["Order"],
    }),
    getOrder: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Order", id }],
    }),
    getStats: builder.query<OrderStats, void>({
      query: () => "/orders/stats",
      providesTags: ["Stats"],
    }),
    updateOrderStatus: builder.mutation<
      { message: string; status: string },
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Order", "Stats"],
    }),
    deleteOrder: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Order", "Stats", "Customer", "Analytics"],
    }),

    addOrderNote: builder.mutation<
      { message: string; note: OrderNote },
      { id: string; note: string }
    >({
      query: ({ id, note }) => ({
        url: `/orders/${id}/notes`,
        method: "POST",
        body: { note },
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: "Order", id }],
    }),
    deleteOrderNote: builder.mutation<
      { message: string },
      { orderId: string; noteId: string }
    >({
      query: ({ orderId, noteId }) => ({
        url: `/orders/${orderId}/notes/${noteId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, { orderId }) => [
        { type: "Order", id: orderId },
      ],
    }),

    bulkUpdateStatus: builder.mutation<
      { message: string; modifiedCount: number },
      { orderIds: string[]; status: string }
    >({
      query: (body) => ({
        url: "/orders/bulk-status",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Order", "Stats"],
    }),

    getCustomers: builder.query<Customer[], { search?: string }>({
      query: ({ search } = {}) => {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        return `/customers?${params.toString()}`;
      },
      providesTags: ["Customer"],
    }),
    getCustomer: builder.query<CustomerDetail, string>({
      query: (email) => `/customers/${encodeURIComponent(email)}`,
      providesTags: ["Customer"],
    }),

    getAnalytics: builder.query<AnalyticsData, void>({
      query: () => "/analytics/revenue",
      providesTags: ["Analytics"],
    }),
    exportOrders: builder.query<string, { status?: string }>({
      query: ({ status } = {}) => ({
        url: `/orders/export${status && status !== "all" ? `?status=${encodeURIComponent(status)}` : ""}`,
        responseHandler: "text",
      }),
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useGetStatsQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
  useAddOrderNoteMutation,
  useDeleteOrderNoteMutation,
  useBulkUpdateStatusMutation,
  useGetCustomersQuery,
  useGetCustomerQuery,
  useGetAnalyticsQuery,
  useLazyExportOrdersQuery,
} = ordersApi;
