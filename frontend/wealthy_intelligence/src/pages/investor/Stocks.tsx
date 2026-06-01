import { useEffect, useState } from "react";
import { useStockStore } from "../../store/stockStore";
import { useHoldingStore } from "../../store/holdingStore";
import { usePortfolioStore } from "../../store/portfolioStore";
import { useTransactionStore } from "../../store/transactionStore";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { 
  TrendingUp, Wallet, Clock, Plus, X, Loader2, Sparkles, CheckCircle, ShieldAlert, ArrowRightLeft, DollarSign 
} from "lucide-react";

const Stocks = () => {
  const {
    stocks,
    selectedStock,
    stockHistory,
    fetchStocks,
    fetchStockHistory,
    setSelectedStock,
  } = useStockStore();

  const { holdings, fetchHoldings } = useHoldingStore();
  const { portfolios, fetchPortfolios } = usePortfolioStore();
  const { transactions, fetchTransactions, buyStock, sellStock } = useTransactionStore();

  const [quantity, setQuantity] = useState("");
  const [selectedPortfolioId, setSelectedPortfolioId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchStocks(),
          fetchHoldings(),
          fetchPortfolios(),
          fetchTransactions(),
        ]);
      } catch (error) {
        console.error("Error loading stocks data:", error);
      }
    };
    loadData();
  }, []);

  // Set default portfolio ID
  useEffect(() => {
    if (portfolios.length > 0 && !selectedPortfolioId) {
      setSelectedPortfolioId(portfolios[0].portfolio_id.toString());
    }
  }, [portfolios, selectedPortfolioId]);

  // Set default stock if none selected
  useEffect(() => {
    if (stocks.length > 0 && !selectedStock) {
      setSelectedStock(stocks[0]);
    }
  }, [stocks, selectedStock, setSelectedStock]);

  useEffect(() => {
    if (selectedStock?.stock_id) {
      fetchStockHistory(selectedStock.stock_id);
    }
  }, [selectedStock, fetchStockHistory]);

  // Auto refresh stocks and history every 8 seconds for a real-time live trading feel!
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await Promise.all([
          fetchStocks(),
          fetchHoldings(),
          fetchTransactions(),
        ]);
        if (selectedStock?.stock_id) {
          await fetchStockHistory(selectedStock.stock_id);
        }
      } catch (error) {
        console.error("Auto refresh stock error:", error);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [selectedStock, fetchStocks, fetchHoldings, fetchTransactions, fetchStockHistory]);

  const handleTrade = async (type: "BUY" | "SELL") => {
    if (!selectedStock) {
      setErrorMsg("Please select a stock first.");
      return;
    }

    if (portfolios.length === 0) {
      setErrorMsg("No portfolio found. Please register a portfolio.");
      return;
    }

    const numQty = Number(quantity);
    if (isNaN(numQty) || numQty <= 0) {
      setErrorMsg("Please enter a valid quantity.");
      return;
    }

    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = {
      portfolio_id: Number(selectedPortfolioId) || portfolios[0].portfolio_id,
      isin_number: selectedStock.isin_number,
      quantity: numQty,
    };

    try {
      if (type === "BUY") {
        if (numQty > Number(selectedStock.available_quantity)) {
          throw new Error("Insufficient stock volume available on the exchange.");
        }
        await buyStock(payload);
        setSuccessMsg(`Successfully purchased ${numQty} shares of ${selectedStock.symbol}!`);
      } else {
        const stockHolding = holdings.find(h => h.asset_type === "STOCK" && h.asset_id === selectedStock.stock_id);
        if (!stockHolding || numQty > Number(stockHolding.quantity)) {
          throw new Error(`Insufficient shares held. You only own ${stockHolding ? stockHolding.quantity : 0} shares.`);
        }
        await sellStock(payload);
        setSuccessMsg(`Successfully sold ${numQty} shares of ${selectedStock.symbol}!`);
      }

      await Promise.all([
        fetchStocks(),
        fetchHoldings(),
        fetchTransactions(),
        fetchPortfolios(),
      ]);
      if (selectedStock?.stock_id) {
        await fetchStockHistory(selectedStock.stock_id);
      }
      setQuantity("");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to process stock transaction.");
    } finally {
      setActionLoading(false);
    }
  };

  const getMyHoldingCount = (stockId: number) => {
    const h = holdings.find(x => x.asset_type === "STOCK" && x.asset_id === stockId);
    return h ? Number(h.quantity).toFixed(0) : "0";
  };

  const stockHoldings = holdings.filter(h => h.asset_type === "STOCK");

  const currentStockValue = stockHoldings.reduce((sum, h) => sum + Number(h.current_value), 0);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span>Smart Equity Market Trading</span>
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Stocks Trading Center
          </h1>
          <p className="text-slate-400 mt-2">
            Buy, sell, and analyze your equity market positions in a highly secure, real-time environment.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">Total Stocks</span>
            <span className="text-2xl font-black text-white mt-1 block">{stocks.length}</span>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">Stock Assets Owned</span>
            <span className="text-2xl font-black text-white mt-1 block">{stockHoldings.length} holdings</span>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">Transactions Completed</span>
            <span className="text-2xl font-black text-white mt-1 block">{transactions.length} orders</span>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">Equity Value</span>
            <span className="text-2xl font-black text-emerald-450 mt-1 block">
              ₹{currentStockValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main trading console grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-8">
        
        {/* Left Side: Live Market Watch List */}
        <div className="bg-slate-800/30 border border-slate-750 p-6 rounded-3xl xl:col-span-1 shadow-md flex flex-col h-[580px] overflow-hidden">
          <div className="flex justify-between items-center mb-5 border-b border-slate-700/60 pb-3">
            <h2 className="text-lg font-bold text-slate-200">Market Watch</h2>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider animate-pulse">
              LIVE Feed
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto pr-1 flex-1">
            {stocks.map((stock) => {
              const change = Number(stock.change_percentage || 0);
              const isUp = change >= 0;
              const isSelected = selectedStock?.stock_id === stock.stock_id;

              return (
                <div
                  key={stock.stock_id}
                  onClick={() => setSelectedStock(stock)}
                  className={`bg-slate-900 border p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:border-indigo-500/30 ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-500/5 shadow-md shadow-indigo-600/5"
                      : "border-slate-800"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-200">{stock.symbol}</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">{stock.exchange}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-100">
                        ₹{Number(stock.current_price).toFixed(2)}
                      </p>
                      <p className={`text-[10px] font-bold flex items-center justify-end gap-0.5 mt-0.5 ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                        {isUp ? "+" : ""}{change.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Stock details, Chart and trading forms */}
        <div className="xl:col-span-3 space-y-6 flex flex-col">
          
          {selectedStock ? (
            <>
              {/* Selected Stock Core Info */}
              <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded">
                        {selectedStock.symbol}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">ISIN: {selectedStock.isin_number}</span>
                    </div>
                    <h2 className="text-2xl font-black text-white mt-2">{selectedStock.company_name}</h2>
                    <p className="text-xs text-slate-400 mt-1">{selectedStock.sector} • {selectedStock.industry}</p>
                  </div>
                  <div className="text-right md:text-right">
                    <span className="text-xs text-slate-500 block">Current Price</span>
                    <span className="text-3xl font-black text-white block mt-1">₹{Number(selectedStock.current_price).toFixed(2)}</span>
                  </div>
                </div>

                {/* Additional metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-900/40 rounded-2xl border border-slate-800/50 mt-6 text-xs">
                  <div>
                    <span className="text-slate-500">Market Cap</span>
                    <span className="font-bold text-slate-200 block mt-1">₹{Number(selectedStock.market_cap || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Listed Exchange</span>
                    <span className="font-bold text-slate-200 block mt-1">{selectedStock.exchange}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Available Volume</span>
                    <span className="font-bold text-slate-200 block mt-1">{Number(selectedStock.available_quantity || 0).toLocaleString("en-IN")} shares</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Your Holdings</span>
                    <span className="font-bold text-indigo-400 block mt-1">{getMyHoldingCount(selectedStock.stock_id)} shares</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Price Area Chart */}
              <div className="bg-slate-800/30 border border-slate-750 p-6 rounded-3xl shadow-md">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <TrendingUp className="w-4.5 h-4.5 text-indigo-400" />
                  Live Performance Trend
                </h3>
                <div className="h-64 w-full bg-slate-950/20 rounded-2xl p-2 border border-slate-850">
                  {stockHistory.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                      Loading chart history...
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stockHistory}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.25} />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                        <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={10} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff" }}
                          formatter={(val) => `₹${Number(val).toLocaleString("en-IN")}`}
                        />
                        <Area type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPrice)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Order form console */}
              <div className="bg-slate-800/30 border border-slate-750 p-6 rounded-3xl shadow-md">
                <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider mb-4 flex items-center gap-1.5 border-b border-slate-750 pb-3">
                  <ArrowRightLeft className="w-4.5 h-4.5 text-indigo-400" />
                  Order Placement Console
                </h3>

                {successMsg && (
                  <div className="flex items-center gap-3 bg-emerald-500/10 text-emerald-450 border border-emerald-500/25 p-3 rounded-xl text-xs mb-4">
                    <CheckCircle className="w-4.5 h-4.5 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="flex items-center gap-3 bg-red-500/10 text-red-450 border border-red-500/25 p-3 rounded-xl text-xs mb-4">
                    <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Inputs */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Select Investment Portfolio</label>
                      <select 
                        value={selectedPortfolioId}
                        onChange={(e) => setSelectedPortfolioId(e.target.value)}
                        className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                      >
                        {portfolios.map((p: any) => (
                          <option key={p.portfolio_id} value={p.portfolio_id}>
                            {p.name || `Portfolio #${p.portfolio_id}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Order Quantity (Shares)</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-bold"
                        placeholder="e.g. 10"
                      />
                    </div>
                  </div>

                  {/* Estimates and Action Buttons */}
                  <div className="bg-slate-950/20 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between">
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Order Estimate:</span>
                        <span className="font-bold text-white">
                          ₹{(Number(quantity || 0) * Number(selectedStock.current_price)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Available on Exchange:</span>
                        <span className="font-semibold text-slate-350">{Number(selectedStock.available_quantity).toLocaleString("en-IN")} units</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <button
                        onClick={() => handleTrade("BUY")}
                        disabled={actionLoading}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-1.5"
                      >
                        {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        Buy Shares
                      </button>
                      <button
                        onClick={() => handleTrade("SELL")}
                        disabled={actionLoading}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-lg shadow-rose-600/10 flex items-center justify-center gap-1.5"
                      >
                        {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                        Sell Shares
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-800/20 border border-slate-800/50 p-10 rounded-3xl text-center flex-1 flex flex-col justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
              <p className="text-slate-500 text-sm">Synchronizing market indices...</p>
            </div>
          )}

        </div>

      </div>

      {/* Unified Holdings table (Stocks only) */}
      <div className="bg-slate-800/30 border border-slate-750 rounded-3xl p-6 shadow-md">
        <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-indigo-400" />
          My Equity Positions
        </h3>

        {stockHoldings.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs italic">
            You do not own any stock assets currently.
          </div>
        ) : (
          <div className="overflow-x-auto pr-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-750 text-slate-500 font-semibold uppercase">
                  <th className="py-2.5 px-3">Symbol</th>
                  <th className="py-2.5 px-3 text-right">Shares Held</th>
                  <th className="py-2.5 px-3 text-right">Average Price</th>
                  <th className="py-2.5 px-3 text-right">Total Invested</th>
                  <th className="py-2.5 px-3 text-right">Market Price</th>
                  <th className="py-2.5 px-3 text-right">Current Valuation</th>
                  <th className="py-2.5 px-3 text-right">Returns (P&L)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stockHoldings.map((h, idx) => {
                  const profit = Number(h.unrealized_profit);
                  const isUp = profit >= 0;
                  const retPct = Number(h.total_invested) > 0 ? (profit / Number(h.total_invested)) * 100 : 0;

                  return (
                    <tr key={idx} className="hover:bg-slate-800/10 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-200">{h.symbol}</td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-300">
                        {Number(h.quantity).toFixed(0)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-350">
                        ₹{Number(h.average_buy_price).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-350">
                        ₹{Number(h.total_invested).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-350">
                        ₹{Number(h.current_market_price).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-100">
                        ₹{Number(h.current_value).toFixed(2)}
                      </td>
                      <td className={`py-3 px-3 text-right font-bold ${isUp ? "text-emerald-450" : "text-red-400"}`}>
                        <div>₹{profit.toFixed(2)}</div>
                        <div className="text-[10px] font-semibold">{isUp ? "+" : ""}{retPct.toFixed(2)}%</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default Stocks;
