import { useState } from "react";
import { AxiosError } from "axios";

import authApi from "../../api/axios";

import { useStockStore } from "../../store/stockStore";

interface StockFormData {
  symbol: string;
  company_name: string;
  exchange: string;
  sector: string;
  industry: string;
  current_price: string;
}

const AddStock = () => {
  const { addStock } = useStockStore();

  const [formData, setFormData] = useState<StockFormData>({
    symbol: "",
    company_name: "",
    exchange: "",
    sector: "",
    industry: "",
    current_price: "",
  });

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  /*
  |--------------------------------------------------------------------------
  | HANDLE CHANGE
  |--------------------------------------------------------------------------
  */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | HANDLE SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    setErrorMessage("");

    setSuccessMessage("");

    try {
      const payload = {
        ...formData,
        current_price: Number(formData.current_price),
      };

      const response = await authApi.post("/api/stocks/create", payload);

      console.log(response.data);

      /*
      |--------------------------------------------------------------------------
      | UPDATE STORE
      |--------------------------------------------------------------------------
      */

      addStock(response.data);

      /*
      |--------------------------------------------------------------------------
      | SUCCESS
      |--------------------------------------------------------------------------
      */

      setSuccessMessage("Stock added successfully");

      /*
      |--------------------------------------------------------------------------
      | RESET FORM
      |--------------------------------------------------------------------------
      */

      setFormData({
        symbol: "",
        company_name: "",
        exchange: "",
        sector: "",
        industry: "",
        current_price: "",
      });
    } catch (error) {
      console.log(error);

      const err = error as AxiosError<any>;

      setErrorMessage(err.response?.data?.message || "Failed to add stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* =======================================================
            LEFT PANEL
        ======================================================= */}

        <div className="hidden lg:flex bg-slate-950 text-white p-10 flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold">WealthMatrix</h1>

            <p className="text-slate-400 mt-2">
              Smart Stock Management Platform
            </p>
          </div>

          <div>
            <h2 className="text-4xl font-bold leading-tight">
              Add and manage stocks effortlessly.
            </h2>

            <p className="mt-5 text-slate-400 leading-7">
              Create stock listings with company, sector, exchange and pricing
              information for your investment ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-5 pt-6 border-t border-slate-800">
            <div>
              <h3 className="text-2xl font-bold">5K+</h3>

              <p className="text-xs text-slate-400 mt-1">Stocks</p>
            </div>

            <div>
              <h3 className="text-2xl font-bold">24/7</h3>

              <p className="text-xs text-slate-400 mt-1">Tracking</p>
            </div>

            <div>
              <h3 className="text-2xl font-bold">Secure</h3>

              <p className="text-xs text-slate-400 mt-1">Platform</p>
            </div>
          </div>
        </div>

        {/* =======================================================
            RIGHT PANEL
        ======================================================= */}

        <div className="p-8 lg:p-12">
          <div className="max-w-lg mx-auto">
            <h2 className="text-3xl font-bold text-slate-900">Add Stock</h2>

            <p className="text-sm text-slate-500 mt-2 mb-8">
              Enter stock details below.
            </p>

            {/* ERROR */}

            {errorMessage && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {errorMessage}
              </div>
            )}

            {/* SUCCESS */}

            {successMessage && (
              <div className="mb-5 p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">
                {successMessage}
              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {/* SYMBOL */}

              <input
                type="text"
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                placeholder="Stock Symbol"
                className="border border-slate-300 p-3 rounded-lg outline-none focus:border-slate-900"
                required
              />

              {/* COMPANY NAME */}

              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="Company Name"
                className="border border-slate-300 p-3 rounded-lg outline-none focus:border-slate-900"
                required
              />

              {/* EXCHANGE */}

              <input
                type="text"
                name="exchange"
                value={formData.exchange}
                onChange={handleChange}
                placeholder="Exchange"
                className="border border-slate-300 p-3 rounded-lg outline-none focus:border-slate-900"
              />

              {/* SECTOR */}

              <input
                type="text"
                name="sector"
                value={formData.sector}
                onChange={handleChange}
                placeholder="Sector"
                className="border border-slate-300 p-3 rounded-lg outline-none focus:border-slate-900"
              />

              {/* INDUSTRY */}

              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                placeholder="Industry"
                className="border border-slate-300 p-3 rounded-lg outline-none focus:border-slate-900 md:col-span-2"
              />

              {/* CURRENT PRICE */}

              <input
                type="number"
                step="0.01"
                name="current_price"
                value={formData.current_price}
                onChange={handleChange}
                placeholder="Current Price"
                className="border border-slate-300 p-3 rounded-lg outline-none focus:border-slate-900 md:col-span-2"
                required
              />

              {/* BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="bg-slate-950 hover:bg-slate-800 text-white p-3 rounded-lg md:col-span-2 transition disabled:opacity-70"
              >
                {loading ? "ADDING STOCK..." : "ADD STOCK"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStock;
