import { useEffect, useState } from "react";
import { useMutualFundStore } from "../../store/mutualFundStore";
import { useSipStore } from "../../store/sipStore";
import { usePortfolioStore } from "../../store/portfolioStore";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, Info, Play, Plus, X, Loader2, Sparkles, CheckCircle, ShieldAlert 
} from "lucide-react";

const MutualFunds = () => {
  const { funds, selectedHistory, loading: fundsLoading, fetchFunds, fetchFundHistory, buyFund } = useMutualFundStore();
  const { createSip } = useSipStore();
  const { portfolios, fetchPortfolios } = usePortfolioStore();

  const [selectedFund, setSelectedFund] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [investType, setInvestType] = useState<"ONE_TIME" | "SIP">("ONE_TIME");
  const [amount, setAmount] = useState<string>("");
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchFunds();
    fetchPortfolios();
  }, [fetchFunds, fetchPortfolios]);

  // Set default portfolio ID
  useEffect(() => {
    if (portfolios.length > 0 && !selectedPortfolioId) {
      setSelectedPortfolioId(portfolios[0].portfolio_id.toString());
    }
  }, [portfolios, selectedPortfolioId]);

  const handleOpenDetail = async (fund: any) => {
    setSelectedFund(fund);
    setShowDetailModal(true);
    await fetchFundHistory(fund.fund_id);
  };

  const handleOpenInvest = (fund: any) => {
    setSelectedFund(fund);
    setAmount(fund.min_investment.toString());
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowInvestModal(true);
  };

  const handleInvestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFund || !amount || !selectedPortfolioId) return;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < Number(selectedFund.min_investment)) {
      setErrorMsg(`Minimum investment is ₹${selectedFund.min_investment}`);
      return;
    }

    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (investType === "ONE_TIME") {
        await buyFund({
          portfolio_id: Number(selectedPortfolioId),
          fund_id: selectedFund.fund_id,
          amount: numAmount,
        });
        setSuccessMsg(`Successfully invested ₹${numAmount.toLocaleString("en-IN")} in ${selectedFund.name}!`);
      } else {
        await createSip({
          portfolio_id: Number(selectedPortfolioId),
          fund_id: selectedFund.fund_id,
          amount: numAmount,
        });
        setSuccessMsg(`Successfully registered Monthly SIP of ₹${numAmount.toLocaleString("en-IN")} for ${selectedFund.name}!`);
      }
      setTimeout(() => {
        setShowInvestModal(false);
        fetchFunds(); // reload funds list
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Something went wrong.");
    } finally {
      setActionLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    const r = risk.toLowerCase();
    if (r.includes("very high")) return "bg-red-500/10 text-red-500 border border-red-500/20";
    if (r.includes("high")) return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
    if (r.includes("moderate")) return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
    return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-medium mb-1">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span>Premium Wealth Management</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Mutual Funds & SIPs
          </h1>
          <p className="text-slate-400 mt-2">
            Build compounding wealth with curated high-performance mutual funds.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      {fundsLoading ? (
        <div className="flex flex-col items-center justify-center h-80 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          <p className="text-slate-400">Loading premium funds...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {funds.map((fund) => {
            const isUp = Number(fund.change_percentage) >= 0;
            return (
              <div 
                key={fund.fund_id}
                className="relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-indigo-500/40 transition-all duration-300 group hover:shadow-2xl hover:shadow-indigo-500/5"
              >
                {/* Symbol & Category */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase bg-indigo-500/10 px-2.5 py-1 rounded-md">
                      {fund.symbol}
                    </span>
                    <h3 className="text-lg font-bold mt-2 text-slate-100 group-hover:text-white transition-colors">
                      {fund.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{fund.category}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-md font-semibold ${getRiskColor(fund.risk_level)}`}>
                    {fund.risk_level} Risk
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-slate-700/50 my-4">
                  <div>
                    <span className="text-xs text-slate-500 block">Current NAV</span>
                    <span className="text-xl font-black text-white mt-1 block">
                      ₹{Number(fund.nav).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Daily Change</span>
                    <span className={`text-sm font-bold flex items-center gap-1 mt-2.5 ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                      {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {isUp ? "+" : ""}{Number(fund.change_percentage).toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-slate-400 mb-6">
                  <span>Expense Ratio: <strong className="text-slate-200">{fund.expense_ratio}%</strong></span>
                  <span>Min Invest: <strong className="text-slate-200">₹{fund.min_investment}</strong></span>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleOpenDetail(fund)}
                    className="flex items-center justify-center gap-2 bg-slate-700/40 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold py-2.5 px-4 rounded-xl border border-slate-600/30 transition-all text-sm"
                  >
                    <Info className="w-4 h-4" />
                    Details
                  </button>
                  <button 
                    onClick={() => handleOpenInvest(fund)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] text-sm"
                  >
                    <Play className="w-4 h-4" />
                    Invest
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details & Chart Modal */}
      {showDetailModal && selectedFund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">{selectedFund.symbol}</span>
                <h2 className="text-2xl font-black text-white">{selectedFund.name}</h2>
              </div>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Core metrics bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-800/30 rounded-2xl border border-slate-800/50 mb-6">
                <div>
                  <span className="text-xs text-slate-500">Current NAV</span>
                  <span className="text-xl font-bold text-white block mt-1">₹{Number(selectedFund.nav).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Category</span>
                  <span className="text-sm font-semibold text-slate-200 block mt-1.5">{selectedFund.category}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Expense Ratio</span>
                  <span className="text-sm font-semibold text-slate-200 block mt-1.5">{selectedFund.expense_ratio}%</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Minimum Investment</span>
                  <span className="text-sm font-semibold text-slate-200 block mt-1.5">₹{selectedFund.min_investment}</span>
                </div>
              </div>

              {/* Chart Panel */}
              <h3 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                Historical Performance (NAV trend)
              </h3>
              <div className="h-72 w-full bg-slate-950/40 rounded-2xl p-4 border border-slate-850">
                {selectedHistory.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedHistory}>
                      <defs>
                        <linearGradient id="colorNav" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff" }}
                        labelStyle={{ color: "#94a3b8", fontSize: "11px" }}
                      />
                      <Area type="monotone" dataKey="nav" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorNav)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="p-6 bg-slate-950/20 border-t border-slate-800 flex justify-end gap-3">
              <button 
                onClick={() => setShowDetailModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 px-6 rounded-xl transition"
              >
                Close Details
              </button>
              <button 
                onClick={() => {
                  setShowDetailModal(false);
                  handleOpenInvest(selectedFund);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-6 rounded-xl transition shadow-lg shadow-indigo-600/30"
              >
                Invest Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invest/SIP Modal */}
      {showInvestModal && selectedFund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-850 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-400" />
                Invest in {selectedFund.symbol}
              </h2>
              <button 
                onClick={() => setShowInvestModal(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInvestSubmit} className="p-6 space-y-4">
              {/* Status messages */}
              {successMsg && (
                <div className="flex items-center gap-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 p-4 rounded-xl text-sm animate-pulse">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="flex items-center gap-3 bg-red-500/10 text-red-400 border border-red-500/20 p-4 rounded-xl text-sm">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Type Switch */}
              <div className="grid grid-cols-2 p-1.5 bg-slate-950/40 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setInvestType("ONE_TIME")}
                  className={`py-2 px-3 text-center text-xs font-bold rounded-lg transition-all ${investType === "ONE_TIME" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-400 hover:text-white"}`}
                >
                  One-time Buy
                </button>
                <button
                  type="button"
                  onClick={() => setInvestType("SIP")}
                  className={`py-2 px-3 text-center text-xs font-bold rounded-lg transition-all ${investType === "SIP" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-400 hover:text-white"}`}
                >
                  Monthly SIP
                </button>
              </div>

              {/* Portfolio Select */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">Select Portfolio</label>
                {portfolios.length === 0 ? (
                  <p className="text-xs text-red-400 mt-1">No portfolios found. Please create one in stock/holding service first.</p>
                ) : (
                  <select 
                    value={selectedPortfolioId}
                    onChange={(e) => setSelectedPortfolioId(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none"
                    required
                  >
                    {portfolios.map((p: any) => (
                      <option key={p.portfolio_id} value={p.portfolio_id}>
                        {p.name || `Portfolio #${p.portfolio_id}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Investment Amount */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-400">Investment Amount (₹)</label>
                  <span className="text-xs text-indigo-400 font-semibold">Min: ₹{selectedFund.min_investment}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white font-bold outline-none"
                    placeholder={`e.g. ${selectedFund.min_investment}`}
                    required
                  />
                </div>
              </div>

              <div className="text-xs text-slate-500 bg-slate-800/20 p-3 rounded-xl border border-slate-800/40">
                {investType === "ONE_TIME" ? (
                  <p>Invest immediately. Units will be allocated to your portfolio at the current NAV of ₹{Number(selectedFund.nav).toFixed(2)}.</p>
                ) : (
                  <p>Register SIP. A monthly payment of ₹{amount || "0"} will be scheduled automatically on this day of each consecutive month.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={actionLoading || portfolios.length === 0}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-800 disabled:to-slate-800 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 mt-4"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing Investment...
                  </>
                ) : (
                  <>
                    {investType === "ONE_TIME" ? <Plus className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                    {investType === "ONE_TIME" ? "Invest One-time" : "Start Monthly SIP"}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MutualFunds;
