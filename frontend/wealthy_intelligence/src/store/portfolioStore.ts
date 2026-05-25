import { create } from "zustand";

import api from "../api/axios";

interface PortfolioState {
  portfolios: any[];

  loading: boolean;

  fetchPortfolios: () => Promise<void>;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  portfolios: [],

  loading: false,

  fetchPortfolios: async () => {
    try {
      set({
        loading: true,
      });

      const response = await api.get("/api/portfolios/my-portfolios");

      set({
        portfolios: response.data,

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
