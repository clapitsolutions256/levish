import { configureStore } from "@reduxjs/toolkit";
import { accountApi } from "./accountApi";
import { adminApi } from "./adminApi";
import { authApi } from "./authApi";
import { cartApi } from "./cartApi";
import { catalogApi } from "./catalogApi";
import { checkoutApi } from "./checkoutApi";
import { ordersApi } from "./ordersApi";

export const store = configureStore({
  reducer: {
    [checkoutApi.reducerPath]: checkoutApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [accountApi.reducerPath]: accountApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [catalogApi.reducerPath]: catalogApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      checkoutApi.middleware,
      ordersApi.middleware,
      authApi.middleware,
      accountApi.middleware,
      cartApi.middleware,
      catalogApi.middleware,
      adminApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
