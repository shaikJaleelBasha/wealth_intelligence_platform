import { useEffect } from "react";
import { useHoldingStore } from "../../store/holdingStore";
import { useStockStore } from "../../store/stockStore";
import { useTransactionStore } from "../../store/transactionStore";
import { Sparkles, TrendingUp, Briefcase, RefreshCw, Layers } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Analytics = () => {
  const { holdings, fetchHoldings } = useHoldingStore();
  const { stocks, fetchStocks } = useStockStore();
  const { transactions, fetchTransactions } = useTransactionStore();

  useEffect(() => {
    fetchHoldings();
    fetchStocks();
    fetchTransactions();
  }, [fetchHoldings, fetchStocks, fetchTransactions]);

  const totalValue = holdings.reduce(
    (acc: number, item: any) => acc + Number(item.current_value || 0),
    0
  );

  const totalInvested = holdings.reduce(
    (acc: number, item: any) => acc + (Number(item.quantity || 0) * Number(item.average_buy_price || 0)),
    0
  );

  const absoluteReturn = totalValue - totalInvested;
  const returnPercentage = totalInvested > 0 ? (absoluteReturn / totalInvested) * 100 : 0;

  const chartData = holdings.map((h) => ({
    name: h.symbol || h.asset_name || "Asset",
    investment: Number(h.quantity || 0) * Number(h.average_buy_price || 0),
    currentValue: Number(h.current_value || 0)
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Glow backgrounds */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-indigo-650/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-violet-650/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="mb-8 relative z-10">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span>Institutional Intelligence Console</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Advanced Portfolio Analytics
        </h1>
        <p className="text-slate-400 mt-2">
          Deconstruct holdings structure, calculate net yields, and evaluate asset distribution parameters.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 mb-8">
        
        {/* STOCKS TRACKED */}
        <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Stocks Tracked</span>
            <span className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-slate-100">{stocks.length}</h2>
            <p className="text-[10px] text-slate-500 mt-1 font-semibold">Available instruments in index</p>
          </div>
        </div>

        {/* ACTIVE HOLDINGS */}
        <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Active Holdings</span>
            <span className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <Briefcase className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-slate-100">{holdings.length}</h2>
            <p className="text-[10px] text-slate-500 mt-1 font-semibold">Allocated portfolio nodes</p>
          </div>
        </div>

        {/* LOGGED TRANSACTIONS */}
        <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Transactions</span>
            <span className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <RefreshCw className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-slate-100">{transactions.length}</h2>
            <p className="text-[10px] text-slate-500 mt-1 font-semibold">Signed ledger operations</p>
          </div>
        </div>

        {/* PORTFOLIO VALUATION */}
        <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Cabinet Valuation</span>
            <span className={`p-2 rounded-xl text-white border ${absoluteReturn >= 0 ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-450" : "bg-red-500/15 border-red-500/25 text-red-450"}`}>
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-slate-100">
              ₹{totalValue.toLocaleString()}
            </h2>
            <p className={`text-[10px] mt-1 font-bold ${absoluteReturn >= 0 ? "text-emerald-450" : "text-red-450"}`}>
              {absoluteReturn >= 0 ? "+" : ""}₹{absoluteReturn.toLocaleString()} ({returnPercentage.toFixed(2)}%)
            </p>
          </div>
        </div>
      </div>

      {/* Asset Distribution Graph Panel */}
      <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl relative z-10">
        <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
          <TrendingUp className="text-indigo-400 w-5 h-5" />
          Holding Performance and Valuation Delta
        </h2>
        {chartData.length > 0 ? (
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInvestment" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px", fontSize: "12px" }}
                  itemStyle={{ color: "#f8fafc" }}
                  labelStyle={{ color: "#64748b", fontWeight: "bold" }}
                />
                <Area type="monotone" dataKey="currentValue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" name="Current Value" />
                <Area type="monotone" dataKey="investment" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorInvestment)" name="Initial Investment" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[250px] flex items-center justify-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
            <p className="text-slate-500 text-xs font-semibold">No active holding items allocated. Deploy capital to populate charts.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
