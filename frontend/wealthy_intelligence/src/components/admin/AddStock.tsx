import { useState, useEffect } from "react";
import { useStockStore } from "../../store/stockStore";
import { Sparkles, Layers, Landmark, TrendingUp, ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const AddStock = () => {
  const { addStock } = useStockStore();

  const [formData, setFormData] = useState({
    symbol: "",
    company_name: "",
    exchange: "NSE",
    sector: "",
    industry: "",
    isin_number: "",
    market_cap: "",
    current_price: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculatedQuantity = Math.floor(
    Number(formData.market_cap || 0) / Number(formData.current_price || 1)
  );

  useEffect(() => {
    if (formData.symbol) {
      const isinSuffix = Math.floor(100000000 + Math.random() * 900000000).toString();
      setFormData((prev) => ({
        ...prev,
        isin_number: prev.isin_number || `INE${prev.symbol.padEnd(5, "X").toUpperCase()}${isinSuffix}`,
        market_cap: prev.market_cap || "1000000000",
        current_price: prev.current_price || "500",
      }));
    }
  }, [formData.symbol]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      await addStock({
        ...formData,
        available_quantity: calculatedQuantity,
      });

      setSuccess(true);
      setFormData({
        symbol: "",
        company_name: "",
        exchange: "NSE",
        sector: "",
        industry: "",
        isin_number: "",
        market_cap: "",
        current_price: "",
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setError("Failed to register stock listing. Check logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 relative overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Glow backgrounds */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-indigo-650/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-violet-650/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Navigation & Header */}
      <div className="mb-8 relative z-10">
        <Link to="/admin/stocks" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Listings
        </Link>
        <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span>Securities Issuer Module</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          List New Security
        </h1>
        <p className="text-slate-400 mt-2">
          Introduce a new asset, set equity metrics, and initialize market trading quantities.
        </p>
      </div>

      <div className="max-w-4xl bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 p-6 md:p-8 rounded-3xl shadow-xl relative z-10">
        
        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-pulse">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-450 animate-bounce" />
            <span>Onboarding listing established successfully!</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-semibold flex items-center gap-2.5">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Symbol */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Stock Symbol</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <TrendingUp className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="e.g. INFOSYS"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-white font-medium"
                  required
                />
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Company Name</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Landmark className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="e.g. Infosys Technologies"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-white font-medium"
                  required
                />
              </div>
            </div>

            {/* Exchange */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Trading Exchange</label>
              <select
                value={formData.exchange}
                onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
                className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none cursor-pointer"
              >
                <option value="NSE">NSE (National Stock Exchange)</option>
                <option value="BSE">BSE (Bombay Stock Exchange)</option>
                <option value="NASDAQ">NASDAQ Index</option>
                <option value="NYSE">NYSE Index</option>
              </select>
            </div>

            {/* Sector */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Industrial Sector</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Layers className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="e.g. Technology"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-white font-medium"
                  required
                />
              </div>
            </div>

            {/* Industry */}
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Detailed Industry</label>
              <input
                type="text"
                placeholder="e.g. Cloud Computing & Digital Services"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-white font-medium"
                required
              />
            </div>

            {/* ISIN */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">ISIN Number</label>
              <input
                type="text"
                placeholder="e.g. INE009A01021"
                value={formData.isin_number}
                onChange={(e) => setFormData({ ...formData, isin_number: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-xs bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-white uppercase font-bold"
                required
              />
            </div>

            {/* Market Cap */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Market Capitalization (INR)</label>
              <input
                type="number"
                placeholder="e.g. 750000000"
                value={formData.market_cap}
                onChange={(e) => setFormData({ ...formData, market_cap: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-white font-medium"
                required
              />
            </div>

            {/* Current Price */}
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Initial Listing Price (INR)</label>
              <input
                type="number"
                placeholder="e.g. 1500"
                value={formData.current_price}
                onChange={(e) => setFormData({ ...formData, current_price: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-white font-medium"
                required
              />
            </div>

            <div className="md:col-span-2 bg-slate-950/40 border border-slate-850 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Auto Calculated Available Shares</p>
                <h3 className="text-2xl font-black text-indigo-400 mt-1">{calculatedQuantity.toLocaleString()}</h3>
              </div>
              <div className="text-right text-[10px] text-slate-600 font-medium">
                <p>Equation: MarketCap / ListingPrice</p>
                <p className="mt-0.5">Asset Type: Stock Equity</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-650/15 transition-all hover:scale-[1.01] text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 disabled:opacity-75"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing Transaction...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Initialize Listing
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStock;
