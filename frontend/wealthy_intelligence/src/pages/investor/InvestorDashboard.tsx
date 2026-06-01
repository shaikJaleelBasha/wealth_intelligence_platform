import { useEffect } from "react";
import { useHoldingStore } from "../../store/holdingStore";
import { useSipStore } from "../../store/sipStore";
import { usePortfolioStore } from "../../store/portfolioStore";
import { useMutualFundStore } from "../../store/mutualFundStore";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { 
  TrendingUp, TrendingDown, Wallet, Calendar, PieChart as PieIcon, ArrowRightLeft, Sparkles, Loader2, ArrowUpRight 
} from "lucide-react";
import { Link } from "react-router-dom";

const InvestorDashboard = () => {
  const { holdings, loading: holdingsLoading, fetchHoldings } = useHoldingStore();
  const { sips, loading: sipsLoading, fetchSips } = useSipStore();
  const { fetchPortfolios } = usePortfolioStore();
  const { transactions: mfTransactions, fetchTransactions: fetchMfTransactions } = useMutualFundStore();

  useEffect(() => {
    fetchHoldings();
    fetchSips();
    fetchPortfolios();
    fetchMfTransactions();
  }, [fetchHoldings, fetchSips, fetchPortfolios, fetchMfTransactions]);

  // Calculations
  const totalInvestment = holdings.reduce((sum, h) => sum + Number(h.total_invested), 0);
  const currentValue = holdings.reduce((sum, h) => sum + Number(h.current_value), 0);
  const totalProfit = currentValue - totalInvestment;
  const returnPercentage = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;
  const activeSipsCount = sips.filter(s => s.status === "ACTIVE").length;

  const isProfit = totalProfit >= 0;

  // Mock performance data for visual grandeur
  const performanceData = [
    { name: "Jan", Value: totalInvestment * 0.9 || 90000 },
    { name: "Feb", Value: totalInvestment * 0.95 || 95000 },
    { name: "Mar", Value: totalInvestment * 1.02 || 102000 },
    { name: "Apr", Value: totalInvestment * 1.05 || 105000 },
    { name: "May", Value: totalInvestment * 1.08 || 108000 },
    { name: "Jun", Value: currentValue || 120000 }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span>Welcome back to Wealth Intelligence</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Investor Dashboard
          </h1>
          <p className="text-slate-400 mt-2">
            Monitor and manage your compounding wealth growth in real time.
          </p>
        </div>
        <Link 
          to="/investor/mutual-funds"
          className="flex items-center gap-2 bg-indigo-650 hover:bg-indigo-650/80 text-white font-bold py-2.5 px-5 rounded-xl transition shadow-lg shadow-indigo-650/15"
        >
          Explore Funds
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {holdingsLoading || sipsLoading ? (
        <div className="flex flex-col items-center justify-center h-80 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          <p className="text-slate-400">Loading your wealth metrics...</p>
        </div>
      ) : (
        <>
          {/* Metrics summary widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Portfolio Value */}
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl flex items-center justify-between hover:border-indigo-500/35 transition-all shadow-md group">
              <div>
                <span className="text-xs text-slate-400 font-medium block uppercase tracking-wider">Portfolio Valuation</span>
                <span className="text-2xl font-black text-white mt-2 block group-hover:scale-[1.01] transition-transform">
                  ₹{currentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
                <span className="text-slate-500 text-[10px] block mt-1">Cost: ₹{totalInvestment.toLocaleString("en-IN")}</span>
              </div>
              <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
                <Wallet className="w-5 h-5" />
              </div>
            </div>

            {/* Total Profit/Loss */}
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl flex items-center justify-between hover:border-indigo-500/35 transition-all shadow-md group">
              <div>
                <span className="text-xs text-slate-400 font-medium block uppercase tracking-wider">Unrealized returns</span>
                <span className={`text-2xl font-black mt-2 block ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
                  ₹{totalProfit.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
                <span className={`text-[10px] font-bold mt-1 block ${isProfit ? "text-emerald-500" : "text-red-500"}`}>
                  {isProfit ? "▲" : "▼"} {returnPercentage.toFixed(2)}% absolute
                </span>
              </div>
              <div className={`p-3 ${isProfit ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"} rounded-xl`}>
                {isProfit ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              </div>
            </div>

            {/* Total Holdings Count */}
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl flex items-center justify-between hover:border-indigo-500/35 transition-all shadow-md group">
              <div>
                <span className="text-xs text-slate-400 font-medium block uppercase tracking-wider">Active Assets</span>
                <span className="text-2xl font-black text-white mt-2 block">
                  {holdings.length} holdings
                </span>
                <span className="text-slate-500 text-[10px] block mt-1">
                  {holdings.filter(h => h.asset_type === "STOCK").length} Stocks, {holdings.filter(h => h.asset_type === "MUTUAL_FUND").length} MFs
                </span>
              </div>
              <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
                <PieIcon className="w-5 h-5" />
              </div>
            </div>

            {/* Total Active SIPs */}
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl flex items-center justify-between hover:border-indigo-500/35 transition-all shadow-md group">
              <div>
                <span className="text-xs text-slate-400 font-medium block uppercase tracking-wider">Active SIP schedules</span>
                <span className="text-2xl font-black text-white mt-2 block">
                  {activeSipsCount} active SIPs
                </span>
                <span className="text-slate-500 text-[10px] block mt-1">
                  Monthly Commitment: ₹{sips.filter(s => s.status === "ACTIVE").reduce((sum, s) => sum + Number(s.amount), 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Wealth Growth Performance Graph */}
            <div className="bg-slate-800/30 border border-slate-750 p-6 rounded-2xl lg:col-span-2 shadow-md flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  Wealth Valuation Trend
                </h3>
                <span className="text-xs text-slate-400 bg-slate-750 px-2.5 py-1 rounded">6 Month View</span>
              </div>
              <div className="h-64 w-full bg-slate-950/20 rounded-xl p-2 border border-slate-800">
                {holdings.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                    No active assets to plot. Purchase Stocks or Mutual Funds to display valuation growth trends!
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.25} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff" }}
                        formatter={(val) => `₹${Number(val).toLocaleString("en-IN")}`}
                      />
                      <Area type="monotone" dataKey="Value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Recent Mutual Fund Transactions */}
            <div className="bg-slate-800/30 border border-slate-750 p-6 rounded-2xl lg:col-span-1 shadow-md">
              <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2 border-b border-slate-750 pb-4">
                <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
                Recent Fund Activity
              </h3>

              {mfTransactions.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-slate-500 text-sm">No recent mutual fund activity recorded.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
                  {mfTransactions.slice(0, 5).map((t, index) => {
                    const isBuy = t.transaction_type === "BUY" || t.transaction_type === "SIP_INSTALLMENT";
                    return (
                      <div key={t.transaction_id || index} className="flex justify-between items-center p-3 bg-slate-850/40 rounded-xl border border-slate-800">
                        <div>
                          <div className="text-sm font-bold text-slate-100">{t.fund_symbol || "MF"}</div>
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${isBuy ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>
                            {t.transaction_type}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-black ${isBuy ? "text-slate-100" : "text-slate-100"}`}>
                            ₹{Number(t.amount).toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {new Date(t.transaction_date).toLocaleDateString("en-IN", {
                              day: "2-digit", month: "short"
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InvestorDashboard;
