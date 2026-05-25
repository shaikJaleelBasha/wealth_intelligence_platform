import { create } from "zustand";

import api from "../api/axios";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

interface StockState {
  stocks: any[];

  selectedStock: any;

  loading: boolean;

  fetchStocks: () => Promise<void>;

  addStock: (data: any) => Promise<void>;

  updateStock: (stockId: number, data: any) => Promise<void>;

  deleteStock: (stockId: number) => Promise<void>;

  setSelectedStock: (stock: any) => void;
}

/*
|--------------------------------------------------------------------------
| STORE
|--------------------------------------------------------------------------
*/

export const useStockStore = create<StockState>((set, get) => ({
  /*
    |--------------------------------------------------------------------------
    | INITIAL STATE
    |--------------------------------------------------------------------------
    */

  stocks: [],

  selectedStock: null,

  loading: false,

  /*
    |--------------------------------------------------------------------------
    | FETCH STOCKS
    |--------------------------------------------------------------------------
    */

  fetchStocks: async () => {
    try {
      set({
        loading: true,
      });

      /*
        |--------------------------------------------------------------------------
        | GET STOCKS
        |--------------------------------------------------------------------------
        */

      const response = await api.get("/api/stocks");

      set({
        stocks: response.data,

        selectedStock: response.data[0] || null,

        loading: false,
      });
    } catch (error) {
      console.log("FETCH STOCKS ERROR:", error);

      set({
        loading: false,
      });
    }
  },

  /*
    |--------------------------------------------------------------------------
    | ADD STOCK
    |--------------------------------------------------------------------------
    */

  addStock: async (data) => {
    try {
      console.log("Sending stock data:", data);

      /*
        |--------------------------------------------------------------------------
        | SEND TO BACKEND
        |--------------------------------------------------------------------------
        */

      const response = await api.post("/api/stocks/create", data);

      console.log("Stock created:", response.data);

      /*
        |--------------------------------------------------------------------------
        | UPDATE LOCAL STATE
        |--------------------------------------------------------------------------
        */

      set((state) => ({
        stocks: [response.data, ...state.stocks],
      }));

      /*
        |--------------------------------------------------------------------------
        | REFRESH STOCKS
        |--------------------------------------------------------------------------
        */

      await get().fetchStocks();
    } catch (error) {
      console.log("ADD STOCK ERROR:", error);

      throw error;
    }
  },

  /*
    |--------------------------------------------------------------------------
    | UPDATE STOCK
    |--------------------------------------------------------------------------
    */

  updateStock: async (stockId, data) => {
    try {
      await api.put(`/api/stocks/${stockId}`, data);

      await get().fetchStocks();
    } catch (error) {
      console.log("UPDATE STOCK ERROR:", error);

      throw error;
    }
  },

  /*
    |--------------------------------------------------------------------------
    | DELETE STOCK
    |--------------------------------------------------------------------------
    */

  deleteStock: async (stockId) => {
    try {
      await api.delete(`/api/stocks/${stockId}`);

      set((state) => ({
        stocks: state.stocks.filter((stock) => stock.stock_id !== stockId),
      }));
    } catch (error) {
      console.log("DELETE STOCK ERROR:", error);

      throw error;
    }
  },

  /*
    |--------------------------------------------------------------------------
    | SET SELECTED STOCK
    |--------------------------------------------------------------------------
    */

  setSelectedStock: (stock) => {
    set({
      selectedStock: stock,
    });
  },
}));
