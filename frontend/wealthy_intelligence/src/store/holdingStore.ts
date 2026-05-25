import { create } from "zustand";

import api from "../api/axios";

interface HoldingState {
  holdings: any[];

  loading: boolean;

  fetchHoldings: () => Promise<void>;
}

export const useHoldingStore = create<HoldingState>((set) => ({
  holdings: [],

  loading: false,

  fetchHoldings: async () => {
    try {
      set({
        loading: true,
      });

      const response = await api.get("/api/holdings");

      set({
        holdings: response.data,

        loading: false,
      });
    } catch (error) {
      console.log(error);

      set({
        loading: false,
      });
    }
  },
}));
