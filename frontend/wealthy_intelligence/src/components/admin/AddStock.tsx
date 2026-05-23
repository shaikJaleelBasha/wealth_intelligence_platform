import { useState } from "react";
import { AxiosError } from "axios";
import authApi from "../../api/axios";

interface StockFormData {
  symbol: string;
  company_name: string;
  exchange: string;
  sector: string;
  industry: string;
  isin_number: string;
  market_cap: string;
  current_price: string;
  is_active: boolean;
}

const AddStock = () => {
  const [formData, setFormData] = useState<StockFormData>({
    symbol: "",
    company_name: "",
    exchange: "",
    sector: "",
    industry: "",
    isin_number: "",
    market_cap: "",
    current_price: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    setFormData({
      ...formData,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload = {
        ...formData,
        market_cap: formData.market_cap ? Number(formData.market_cap) : null,
        current_price: formData.current_price
          ? Number(formData.current_price)
          : null,
      };

      const response = await authApi.post("/api/stocks/create", payload);

      console.log("API RESPONSE:", response.data);

      setSuccessMessage("Stock added successfully");

      setFormData({
        symbol: "",
        company_name: "",
        exchange: "",
        sector: "",
        industry: "",
        isin_number: "",
        market_cap: "",
        current_price: "",
        is_active: true,
      });
    } catch (error) {
      console.log(error);

      const err = error as AxiosError<any>;

      const message = err.response?.data?.message;

      setErrorMessage(message || "Failed to add stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        {/* LEFT PANEL */}
        <div className="hidden lg:flex w-1/2 bg-[#0B131F] text-white p-10 flex-col justify-between relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-20 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop')",
            }}
          />

          {/* LOGO */}
          <div className="relative z-10">
            <h1 className="text-2xl font-bold tracking-wide">WealthMatrix</h1>

            <p className="text-slate-400 text-sm mt-1">
              Smart Investment Management
            </p>
          </div>

          {/* CONTENT */}
          <div className="relative z-10 max-w-md">
            <h2 className="text-4xl font-bold leading-tight">
              Add and manage market stocks seamlessly.
            </h2>

            <p className="mt-5 text-slate-400 leading-7 text-sm">
              Track listed companies, exchanges, sectors, market capitalization,
              and live pricing data in one secure investment platform.
            </p>
          </div>

          {/* STATS */}
          <div className="relative z-10 grid grid-cols-3 gap-5 border-t border-slate-700 pt-6">
            <div>
              <div className="text-xl font-bold">5K+</div>
              <div className="text-xs text-slate-400 mt-1">Listed Stocks</div>
            </div>

            <div>
              <div className="text-xl font-bold">$8.2B</div>
              <div className="text-xs text-slate-400 mt-1">Market Volume</div>
            </div>

            <div>
              <div className="text-xl font-bold">24/7</div>
              <div className="text-xs text-slate-400 mt-1">Live Tracking</div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 bg-white">
          <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900">Add Stock</h2>

            <p className="text-sm text-slate-500 mt-2 mb-8">
              Enter stock details to create a new stock entry.
            </p>

            {/* ERROR MESSAGE */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {errorMessage}
              </div>
            )}

            {/* SUCCESS MESSAGE */}
            {successMessage && (
              <div className="mb-5 p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* SYMBOL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Stock Symbol *
                </label>

                <input
                  type="text"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleChange}
                  placeholder="AAPL"
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-slate-900"
                  required
                />
              </div>

              {/* COMPANY NAME */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company Name *
                </label>

                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Apple Inc."
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-slate-900"
                  required
                />
              </div>

              {/* GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* EXCHANGE */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Exchange
                  </label>

                  <input
                    type="text"
                    name="exchange"
                    value={formData.exchange}
                    onChange={handleChange}
                    placeholder="NASDAQ"
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-slate-900"
                  />
                </div>

                {/* SECTOR */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sector
                  </label>

                  <input
                    type="text"
                    name="sector"
                    value={formData.sector}
                    onChange={handleChange}
                    placeholder="Technology"
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* INDUSTRY */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Industry
                </label>

                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  placeholder="Consumer Electronics"
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-slate-900"
                />
              </div>

              {/* ISIN */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ISIN Number
                </label>

                <input
                  type="text"
                  name="isin_number"
                  value={formData.isin_number}
                  onChange={handleChange}
                  placeholder="US0378331005"
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-slate-900"
                />
              </div>

              {/* MARKET CAP + CURRENT PRICE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Market Cap
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    name="market_cap"
                    value={formData.market_cap}
                    onChange={handleChange}
                    placeholder="1000000000"
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Price
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    name="current_price"
                    value={formData.current_price}
                    onChange={handleChange}
                    placeholder="210.55"
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* ACTIVE STATUS */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 accent-slate-900"
                />

                <label className="text-sm text-slate-700">Active Stock</label>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-950 hover:bg-slate-800 text-white py-3 rounded-lg text-sm font-medium transition disabled:opacity-70"
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
