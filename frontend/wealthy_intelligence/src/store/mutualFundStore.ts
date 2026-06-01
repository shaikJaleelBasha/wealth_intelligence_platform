import { create } from "zustand";
import api from "../api/axios";

interface MutualFundState {
  funds: any[];
  selectedHistory: any[];
  transactions: any[];
  loading: boolean;
  fetchFunds: () => Promise<void>;
  fetchFundHistory: (fundId: number) => Promise<void>;
  buyFund: (data: { portfolio_id: number; fund_id: number; amount: number }) => Promise<any>;
  sellFund: (data: { portfolio_id: number; fund_id: number; units: number }) => Promise<any>;
  createFund: (data: any) => Promise<void>;
  updateNav: (fundId: number, nav: number) => Promise<void>;
  deleteFund: (fundId: number) => Promise<void>;
  fetchTransactions: () => Promise<void>;
}

export const useMutualFundStore = create<MutualFundState>((set) => ({
  funds: [],
  selectedHistory: [],
  transactions: [],
  loading: false,

  fetchFunds: async () => {
    try {
      set({ loading: true });
      const response = await api.get("/api/mutualfunds");
      set({ funds: response.data, loading: false });
    } catch (error) {
      console.error("Error fetching mutual funds:", error);
      set({ loading: false });
    }
  },

  fetchFundHistory: async (fundId) => {
    try {
      set({ loading: true });
      const response = await api.get(`/api/mutualfunds/${fundId}/history`);
      set({ selectedHistory: response.data, loading: false });
    } catch (error) {
      console.error("Error fetching fund history:", error);
      set({ loading: false });
    }
  },

  buyFund: async (data) => {
    const response = await api.post("/api/mutualfunds/buy", data);
    return response.data;
  },

  sellFund: async (data) => {
    const response = await api.post("/api/mutualfunds/sell", data);
    return response.data;
  },

  createFund: async (data) => {
    await api.post("/api/mutualfunds", data);
  },

  updateNav: async (fundId, nav) => {
    await api.put(`/api/mutualfunds/${fundId}/nav`, { nav });
  },

  deleteFund: async (fundId) => {
    await api.delete(`/api/mutualfunds/${fundId}`);
  },

  fetchTransactions: async () => {
    try {
      set({ loading: true });
      const response = await api.get("/api/mutualfunds/transactions");
      set({ transactions: response.data, loading: false });
    } catch (error) {
      console.error("Error fetching fund transactions:", error);
      set({ loading: false });
    }
  },
}));
