import { useEffect, useState } from "react";
import { useMutualFundStore } from "../../store/mutualFundStore";
import { useStockStore } from "../../store/stockStore";
import api from "../../api/axios";
import { 
  TrendingUp, Cpu, Server, Plus, Database, RefreshCw, Loader2, Clock, Trash2, Sparkles, CheckCircle 
} from "lucide-react";

const AdminDashboard = () => {
  const { funds, fetchFunds, createFund, updateNav, deleteFund, loading: fundsLoading } = useMutualFundStore();
  const { stocks, fetchStocks, addStock } = useStockStore();

  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Tab State for Instruments panel
  const [activeTab, setActiveTab] = useState<"MUTUAL_FUNDS" | "STOCKS">("MUTUAL_FUNDS");

  // Manage Fund form state
  const [showAddFund, setShowAddFund] = useState(false);
  const [fundName, setFundName] = useState("");
  const [fundSymbol, setFundSymbol] = useState("");
  const [fundCategory, setFundCategory] = useState("Equity - Large Cap");
  const [fundRisk, setFundRisk] = useState("High");
  const [fundNav, setFundNav] = useState("");
  const [fundExpense, setFundExpense] = useState("");
  const [fundMin, setFundMin] = useState("");
  
  // Manage Stock form state (User previously implemented AddStock)
  const [showAddStock, setShowAddStock] = useState(false);
  const [stockSymbol, setStockSymbol] = useState("");
  const [stockCompanyName, setStockCompanyName] = useState("");
  const [stockExchange, setStockExchange] = useState("NSE");
  const [stockSector, setStockSector] = useState("");
  const [stockIndustry, setStockIndustry] = useState("");
  const [stockPrice, setStockPrice] = useState("");
  const [stockIsin, setStockIsin] = useState("");
  const [stockMarketCap, setStockMarketCap] = useState("");
  const [stockQty, setStockQty] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  
  // NAV editing states
  const [editingNavs, setEditingNavs] = useState<Record<number, string>>({});
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const response = await api.get("/api/admin/logs");
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching gateway request logs:", error);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchFunds();
    fetchStocks();
    fetchLogs();
  }, [fetchFunds, fetchStocks]);

  // Generate default ISIN, Market Cap, Qty when Stock Symbol or Price changes
  useEffect(() => {
    if (stockSymbol) {

      setStockIsin(`INE${Math.floor(1000000000 + Math.random() * 9000000000)}`);
      setStockQty("1000000");
      if (stockPrice) {
        setStockMarketCap((Number(stockPrice) * 10000000).toString());
      } else {
        setStockMarketCap("500000000");
      }
    }
  }, [stockSymbol, stockPrice]);

  // Auto refresh logs every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleAddFundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundName || !fundSymbol || !fundNav || !fundExpense || !fundMin) return;

    setActionLoading(true);
    setStatusMsg(null);
    try {
      await createFund({
        name: fundName,
        symbol: fundSymbol,
        category: fundCategory,
        risk_level: fundRisk,
        nav: Number(fundNav),
        expense_ratio: Number(fundExpense),
        min_investment: Number(fundMin)
      });
      setStatusMsg("Mutual fund created successfully!");
      setFundName("");
      setFundSymbol("");
      setFundNav("");
      setFundExpense("");
      setFundMin("");
      setShowAddFund(false);
      fetchFunds();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create mutual fund.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockSymbol || !stockCompanyName || !stockPrice) return;

    setActionLoading(true);
    setStatusMsg(null);
    try {
      const payload = {
        symbol: stockSymbol.trim().toUpperCase(),
        company_name: stockCompanyName.trim(),
        exchange: stockExchange.trim(),
        sector: stockSector.trim() || "Technology",
        industry: stockIndustry.trim() || "IT Services",
        isin_number: stockIsin.trim() || `INE${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        market_cap: Number(stockMarketCap) || 500000000,
        current_price: Number(stockPrice),
        available_quantity: Number(stockQty) || 1000000
      };

      const response = await api.post("/api/stocks/create", payload);
      
      // Update store
      addStock(response.data);
      
      setStatusMsg(`Stock ${payload.symbol} listed successfully!`);
      setStockSymbol("");
      setStockCompanyName("");
      setStockSector("");
      setStockIndustry("");
      setStockPrice("");
      setShowAddStock(false);
      fetchStocks();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to list new stock.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleNavUpdate = async (fundId: number) => {
    const nextNav = editingNavs[fundId];
    if (!nextNav || isNaN(Number(nextNav)) || Number(nextNav) <= 0) {
      alert("Please enter a valid NAV value.");
      return;
    }

    try {
      await updateNav(fundId, Number(nextNav));
      setStatusMsg(`Updated NAV successfully to ₹${nextNav}!`);
      setEditingNavs(prev => {
        const next = { ...prev };
        delete next[fundId];
        return next;
      });
      fetchFunds();
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update NAV.");
    }
  };

  const handleDeleteFund = async (fundId: number) => {
    if (!confirm("Are you sure you want to delete this Mutual Fund? This will delete all transaction history as well.")) return;
    try {
      await deleteFund(fundId);
      setStatusMsg("Mutual fund deleted successfully.");
      fetchFunds();
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete mutual fund.");
    }
  };

  const handleDeleteStock = async (stockId: number) => {
    if (!confirm("Are you sure you want to delete this Stock? This will remove it from the market list.")) return;
    try {
      await api.delete(`/api/stocks/${stockId}`);
      setStatusMsg("Stock deleted successfully.");
      fetchStocks();
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete stock.");
    }
  };

  const getMethodBadge = (method: string) => {
    const m = method.toUpperCase();
    if (m === "GET") return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    if (m === "POST") return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
    if (m === "PUT") return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
  };

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (status >= 400 && status < 500) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-red-400 bg-red-500/10 border-red-500/20";
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span>Administrative Control Center</span>
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 mt-2">
            System administration workspace to manage financial assets, simulate markets, and audit API traffic.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div className="flex items-center gap-3 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 p-4 rounded-xl text-sm mb-6 animate-pulse">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{statusMsg}</span>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">Total Stocks</span>
            <span className="text-3xl font-black text-white mt-2 block">{stocks.length} listed</span>
          </div>
          <div className="p-4 bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">Total Mutual Funds</span>
            <span className="text-3xl font-black text-white mt-2 block">{funds.length} assets</span>
          </div>
          <div className="p-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-2xl">
            <Database className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">Gateway Requests</span>
            <span className="text-3xl font-black text-white mt-2 block">{logs.length}+ logged</span>
          </div>
          <div className="p-4 bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 rounded-2xl">
            <Server className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">System Latency</span>
            <span className="text-3xl font-black text-emerald-400 mt-2 block">
              {logs.length > 0 ? (logs.reduce((sum, l) => sum + Number(l.duration_ms), 0) / logs.length).toFixed(1) : "0"} ms
            </span>
          </div>
          <div className="p-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* MUTUAL FUND & STOCKS PANEL */}
        <div className="bg-slate-800/30 border border-slate-750 p-6 rounded-3xl lg:col-span-2 shadow-md flex flex-col">
          
          {/* Tabs switch */}
          <div className="flex justify-between items-center mb-6 border-b border-slate-700/60 pb-3">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("MUTUAL_FUNDS")}
                className={`py-2 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === "MUTUAL_FUNDS" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15" : "text-slate-400 hover:text-slate-200"}`}
              >
                Mutual Funds
              </button>
              <button
                onClick={() => setActiveTab("STOCKS")}
                className={`py-2 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === "STOCKS" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15" : "text-slate-400 hover:text-slate-200"}`}
              >
                Stocks Trading
              </button>
            </div>

            {activeTab === "MUTUAL_FUNDS" ? (
              <button
                onClick={() => { setShowAddFund(!showAddFund); setShowAddStock(false); }}
                className="bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-1.5 px-3.5 rounded-xl text-xs flex items-center gap-1 transition"
              >
                <Plus className="w-4 h-4" />
                Create Fund
              </button>
            ) : (
              <button
                onClick={() => { setShowAddStock(!showAddStock); setShowAddFund(false); }}
                className="bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-1.5 px-3.5 rounded-xl text-xs flex items-center gap-1 transition"
              >
                <Plus className="w-4 h-4" />
                Add Stock Listing
              </button>
            )}
          </div>

          {/* ADD MUTUAL FUND FORM */}
          {showAddFund && activeTab === "MUTUAL_FUNDS" && (
            <form onSubmit={handleAddFundSubmit} className="bg-slate-900 border border-slate-800/60 p-5 rounded-2xl mb-6 space-y-4 animate-in slide-in-from-top-3 duration-200">
              <h3 className="font-bold text-sm text-indigo-400 border-b border-slate-800 pb-2">New Mutual Fund Configuration</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Fund Name</label>
                  <input
                    type="text"
                    value={fundName}
                    onChange={(e) => setFundName(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    placeholder="e.g. SBI Bluechip Fund"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Symbol / Code</label>
                  <input
                    type="text"
                    value={fundSymbol}
                    onChange={(e) => setFundSymbol(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    placeholder="e.g. SBIBLUE"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Category</label>
                  <select
                    value={fundCategory}
                    onChange={(e) => setFundCategory(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                  >
                    <option value="Equity - Large Cap">Equity - Large Cap</option>
                    <option value="Equity - Index">Equity - Index</option>
                    <option value="Equity - Flexi Cap">Equity - Flexi Cap</option>
                    <option value="Equity - Small Cap">Equity - Small Cap</option>
                    <option value="Debt - Liquid">Debt - Liquid</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Risk Profile</label>
                  <select
                    value={fundRisk}
                    onChange={(e) => setFundRisk(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                  >
                    <option value="Low">Low Risk</option>
                    <option value="Moderate">Moderate Risk</option>
                    <option value="High">High Risk</option>
                    <option value="Very High">Very High Risk</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Initial NAV (₹)</label>
                  <input
                    type="number"
                    step="any"
                    value={fundNav}
                    onChange={(e) => setFundNav(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    placeholder="85.50"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Expense Ratio (%)</label>
                  <input
                    type="number"
                    step="any"
                    value={fundExpense}
                    onChange={(e) => setFundExpense(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    placeholder="1.25"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Min Investment (₹)</label>
                  <input
                    type="number"
                    value={fundMin}
                    onChange={(e) => setFundMin(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    placeholder="500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="bg-indigo-650 hover:bg-indigo-600 disabled:bg-slate-800 w-full text-white font-bold py-2 rounded-xl text-xs transition"
              >
                {actionLoading ? "Creating Fund..." : "Add Fund to Platform"}
              </button>
            </form>
          )}

          {/* ADD STOCK FORM (REPLICATED FROM PREVIOUS IMPLEMENTATION) */}
          {showAddStock && activeTab === "STOCKS" && (
            <form onSubmit={handleAddStockSubmit} className="bg-slate-900 border border-slate-800/60 p-5 rounded-2xl mb-6 space-y-4 animate-in slide-in-from-top-3 duration-200">
              <h3 className="font-bold text-sm text-indigo-400 border-b border-slate-800 pb-2">Listing Stock listing in market</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Stock Symbol</label>
                  <input
                    type="text"
                    value={stockSymbol}
                    onChange={(e) => setStockSymbol(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    placeholder="e.g. INFY"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Company Name</label>
                  <input
                    type="text"
                    value={stockCompanyName}
                    onChange={(e) => setStockCompanyName(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    placeholder="e.g. Infosys Ltd"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Exchange</label>
                  <select
                    value={stockExchange}
                    onChange={(e) => setStockExchange(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                  >
                    <option value="NSE">NSE</option>
                    <option value="BSE">BSE</option>
                    <option value="NASDAQ">NASDAQ</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Sector</label>
                  <input
                    type="text"
                    value={stockSector}
                    onChange={(e) => setStockSector(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    placeholder="e.g. Technology"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Industry</label>
                  <input
                    type="text"
                    value={stockIndustry}
                    onChange={(e) => setStockIndustry(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    placeholder="e.g. IT Services"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Stock Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={stockPrice}
                    onChange={(e) => setStockPrice(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    placeholder="1450.00"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">ISIN Number</label>
                  <input
                    type="text"
                    value={stockIsin}
                    onChange={(e) => setStockIsin(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-350 outline-none"
                    placeholder="Auto-generated ISIN"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Market Cap (₹)</label>
                  <input
                    type="number"
                    value={stockMarketCap}
                    onChange={(e) => setStockMarketCap(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    placeholder="e.g. 50000000"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Available Qty</label>
                  <input
                    type="number"
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    placeholder="1000000"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="bg-indigo-650 hover:bg-indigo-600 disabled:bg-slate-800 w-full text-white font-bold py-2 rounded-xl text-xs transition"
              >
                {actionLoading ? "Adding Stock listing..." : "List Stock on Exchange"}
              </button>
            </form>
          )}

          {/* MUTUAL FUNDS GRID VIEW */}
          {activeTab === "MUTUAL_FUNDS" && (
            fundsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-slate-400 text-xs">Loading mutual funds...</p>
              </div>
            ) : (
              <div className="overflow-x-auto pr-1">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-750 text-slate-500 font-semibold uppercase">
                      <th className="py-2.5 px-3">Fund</th>
                      <th className="py-2.5 px-3 text-right">Current NAV</th>
                      <th className="py-2.5 px-3 text-center">New NAV (Simulation)</th>
                      <th className="py-2.5 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {funds.map((f) => (
                      <tr key={f.fund_id} className="hover:bg-slate-800/10 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-200">{f.name}</div>
                          <div className="text-[10px] text-slate-500">{f.symbol} • {f.category}</div>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-100">
                          ₹{Number(f.nav).toFixed(4)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-slate-500 font-bold">₹</span>
                            <input
                              type="number"
                              step="any"
                              value={editingNavs[f.fund_id] || ""}
                              onChange={(e) => setEditingNavs({ ...editingNavs, [f.fund_id]: e.target.value })}
                              className="bg-slate-950/40 border border-slate-800 focus:border-indigo-500 text-white font-bold rounded-lg px-2.5 py-1 w-20 outline-none text-right"
                              placeholder="New NAV"
                            />
                            <button
                              onClick={() => handleNavUpdate(f.fund_id)}
                              className="bg-indigo-600/15 hover:bg-indigo-650 text-indigo-400 hover:text-white border border-indigo-500/20 px-2 py-1 rounded-lg font-bold"
                            >
                              Update
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleDeleteFund(f.fund_id)}
                            className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 p-1.5 rounded-lg transition"
                            title="Delete Fund"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* STOCKS GRID VIEW */}
          {activeTab === "STOCKS" && (
            <div className="overflow-x-auto pr-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-750 text-slate-500 font-semibold uppercase">
                    <th className="py-2.5 px-3">Stock listing</th>
                    <th className="py-2.5 px-3">ISIN Number</th>
                    <th className="py-2.5 px-3 text-right">Market Price</th>
                    <th className="py-2.5 px-3 text-right">Available Qty</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {stocks.map((s) => (
                    <tr key={s.stock_id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-200">{s.symbol}</div>
                        <div className="text-[10px] text-slate-500">{s.company_name} • {s.exchange}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[10px] text-slate-400">
                        {s.isin_number}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-100">
                        ₹{Number(s.current_price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-350">
                        {Number(s.available_quantity || 1000000).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleDeleteStock(s.stock_id)}
                          className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 p-1.5 rounded-lg transition"
                          title="Delete Stock Listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* GATEWAY LOGS PANEL */}
        <div className="bg-slate-800/30 border border-slate-750 p-6 rounded-3xl lg:col-span-1 shadow-md flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              Gateway Logs
            </h2>
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer" title="Auto Refresh Logs (5s)">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-7 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
              <button
                onClick={fetchLogs}
                disabled={logsLoading}
                className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl transition"
                title="Manual Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${logsLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 mb-4 uppercase tracking-wider font-semibold">
            API interceptor feed (Latest 100 requests logged by Gateway)
          </p>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {logsLoading && logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-slate-400 text-[10px]">Streaming logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs italic">
                No request logs found in Supabase database.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.log_id} className="bg-slate-900 border border-slate-800/60 p-3 rounded-2xl space-y-2 hover:border-indigo-500/15 transition duration-150">
                  <div className="flex justify-between items-center">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${getMethodBadge(log.method)}`}>
                      {log.method}
                    </span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${getStatusBadge(log.status)}`}>
                      {log.status}
                    </span>
                  </div>
                  <div className="text-slate-300 font-mono text-[10px] truncate" title={log.path}>
                    {log.path}
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-800/60 pt-2">
                    <div className="truncate max-w-[120px]" title={log.user_email}>
                      Email: <strong className="text-slate-350">{log.user_email}</strong>
                    </div>
                    <span className="font-bold text-slate-400">{Number(log.duration_ms).toFixed(0)} ms</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
