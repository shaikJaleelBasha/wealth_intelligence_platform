import { create } from "zustand";
import api from "../api/axios";

interface SipState {
  sips: any[];
  loading: boolean;
  fetchSips: () => Promise<void>;
  createSip: (data: { portfolio_id: number; fund_id: number; amount: number }) => Promise<any>;
  updateSipStatus: (sipId: number, status: string) => Promise<any>;
}

export const useSipStore = create<SipState>((set) => ({
  sips: [],
  loading: false,

  fetchSips: async () => {
    try {
      set({ loading: true });
      const response = await api.get("/api/sips");
      set({ sips: response.data, loading: false });
    } catch (error) {
      console.error("Error fetching sips:", error);
      set({ loading: false });
    }
  },

  createSip: async (data) => {
    const response = await api.post("/api/sips", data);
    return response.data;
  },

  updateSipStatus: async (sipId, status) => {
    const response = await api.put(`/api/sips/${sipId}/status`, { status });
    return response.data;
  },
}));
