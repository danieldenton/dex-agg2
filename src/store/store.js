import { configureStore } from "@reduxjs/toolkit";
import provider from "./reducers/provider";
import tokens from "./reducers/tokens";
import dexAgg from "./reducers/dexAggregator";

export const store = configureStore({
  reducer: {
    provider,
    tokens,
    dexAgg
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
