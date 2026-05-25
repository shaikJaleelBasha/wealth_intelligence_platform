import { create } from "zustand";

import api from "../api/axios";

interface TransactionState {
  /*
  |--------------------------------------------------------------------------
  | STATES
  |--------------------------------------------------------------------------
  */

  transactions: any[];

  loading: boolean;

  /*
  |--------------------------------------------------------------------------
  | ACTIONS
  |--------------------------------------------------------------------------
  */

  fetchTransactions: () => Promise<void>;

  buyStock: (data: any) => Promise<void>;

  sellStock: (data: any) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  /*
      |--------------------------------------------------------------------------
      | INITIAL STATE
      |--------------------------------------------------------------------------
      */

  transactions: [],

  loading: false,

 

  fetchTransactions: async () => {
    try {
      set({
        loading: true,
      });

      const response = await api.get("/api/transactions/history");

      set({
        transactions: response.data,

        loading: false,
      });
    } catch (error) {
      console.log(error);

      set({
        loading: false,
      });
    }
  },

  /*
      |--------------------------------------------------------------------------
      | BUY STOCK
      |--------------------------------------------------------------------------
      */

  buyStock: async (data) => {
    await api.post("/api/transactions/buy", data);
  },

  /*
      |--------------------------------------------------------------------------
      | SELL STOCK
      |--------------------------------------------------------------------------
      */

  sellStock: async (data) => {
    await api.post("/api/transactions/sell", data);
  },
}));
