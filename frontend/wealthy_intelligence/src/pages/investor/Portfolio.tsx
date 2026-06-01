import { useEffect, useState } from "react";
import { useHoldingStore } from "../../store/holdingStore";
import { useSipStore } from "../../store/sipStore";
import { usePortfolioStore } from "../../store/portfolioStore";
import { useMutualFundStore } from "../../store/mutualFundStore";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from "recharts";
import { 
  TrendingUp, Wallet, Calendar, AlertTriangle, ShieldCheck, DollarSign, Loader2, Play, Pause, Trash2, X, Sparkles, CheckCircle, HelpCircle 
} from "lucide-react";

const Portfolio = () => {
  const { holdings, loading: holdingsLoading, fetchHoldings } = useHoldingStore();
  const { sips, loading: sipsLoading, fetchSips, updateSipStatus } = useSipStore();
  const { fetchPortfolios } = usePortfolioStore();
  const { sellFund, fetchFunds, funds } = useMutualFundStore();

  const [selectedHolding, setSelectedHolding] = useState<any>(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemUnits, setRedeemUnits] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchHoldings();
    fetchSips();
    fetchPortfolios();
    fetchFunds();
  }, [fetchHoldings, fetchSips, fetchPortfolios, fetchFunds]);

  // Aggregate stats
  const totalInvestment = holdings.reduce((sum, h) => sum + Number(h.total_invested), 0);
  const currentValue = holdings.reduce((sum, h) => sum + Number(h.current_value), 0);
  const totalProfit = currentValue - totalInvestment;
  const profitPercentage = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;
  const isProfit = totalProfit >= 0;

  // Pie chart asset allocation: STOCKS vs MUTUAL_FUNDS
  const stockValue = holdings.filter(h => h.asset_type === "STOCK").reduce((sum, h) => sum + Number(h.current_value), 0);
  const mfValue = holdings.filter(h => h.asset_type === "MUTUAL_FUND").reduce((sum, h) => sum + Number(h.current_value), 0);

  const allocationData = [
    { name: "Stocks", value: stockValue },
    { name: "Mutual Funds", value: mfValue }
  ].filter(item => item.value > 0);

  const PIE_COLORS = ["#6366f1", "#10b981"];

  // Bar chart: Holdings breakdown
  const barChartData = holdings.map(h => {
    // Find name if mutual fund or display symbol
    let displayName = h.symbol || `Asset #${h.asset_id}`;
    if (h.asset_type === "MUTUAL_FUND") {
      const fund = funds.find(f => f.fund_id === h.asset_id);
      displayName = fund ? fund.symbol : `MF #${h.asset_id}`;
    }
    return {
      name: displayName,
      Invested: Number(h.total_invested),
      Current: Number(h.current_value)
    };
  });

  const handleOpenRedeem = (holding: any) => {
    setSelectedHolding(holding);
    setRedeemUnits(holding.quantity.toString());
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowRedeemModal(true);
  };

  const handleRedeemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHolding || !redeemUnits) return;

    const units = Number(redeemUnits);
    if (isNaN(units) || units <= 0 || units > Number(selectedHolding.quantity)) {
      setErrorMsg(`Please enter units between 0 and ${selectedHolding.quantity}`);
      return;
    }

    setRedeemLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await sellFund({
        portfolio_id: selectedHolding.portfolio_id,
        fund_id: selectedHolding.asset_id,
        units: units
      });

      setSuccessMsg(`Successfully redeemed ${units} units of your mutual fund!`);
      setTimeout(() => {
        setShowRedeemModal(false);
        fetchHoldings(); // reload holdings
        fetchPortfolios(); // reload portfolios
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to redeem units.");
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleToggleSip = async (sipId: number, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      await updateSipStatus(sipId, nextStatus);
      fetchSips();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update SIP status.");
    }
  };

  const handleCancelSip = async (sipId: number) => {
    if (!confirm("Are you sure you want to cancel this Systematic Investment Plan?")) return;
    try {
      await updateSipStatus(sipId, "CANCELLED");
      fetchSips();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to cancel SIP.");
    }
  };

  const getSipStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === "ACTIVE") return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    if (s === "PAUSED") return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
  };

  const getFundName = (fundId: number) => {
    const fund = funds.find(f => f.fund_id === fundId);
    return fund ? fund.name : `Mutual Fund #${fundId}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-medium mb-1">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span>Premium Portfolio Analytics</span>
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            My Wealth Portfolio
          </h1>
          <p className="text-slate-400 mt-2">
            Consolidated overview of all stocks, mutual funds, and automated SIPs.
          </p>
        </div>
      </div>

      {/* Main summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Investment Card */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">Total Investment</span>
            <span className="text-3xl font-black text-white mt-2 block">
              ₹{totalInvestment.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-4 bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 rounded-2xl">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Current Value Card */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">Current Value</span>
            <span className="text-3xl font-black text-white mt-2 block">
              ₹{currentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Net Profit / Loss Card */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">Total Returns (P&L)</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-3xl font-black ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
                ₹{totalProfit.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
              <span className={`text-sm font-bold flex items-center gap-0.5 ${isProfit ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10"} px-2 py-0.5 rounded-md border ${isProfit ? "border-emerald-500/20" : "border-red-500/20"}`}>
                {isProfit ? "+" : ""}{profitPercentage.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className={`p-4 ${isProfit ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" : "bg-red-500/10 text-red-400 border border-red-500/25"} rounded-2xl`}>
            {isProfit ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      {holdings.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Asset Allocation Pie Chart */}
          <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-750 p-6 rounded-2xl lg:col-span-1 shadow-md">
            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Asset Allocation
            </h3>
            <div className="h-64 w-full flex items-center justify-center">
              {allocationData.length === 0 ? (
                <p className="text-slate-500 text-sm">No allocation data.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {allocationData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff" }}
                      formatter={(val) => `₹${Number(val).toLocaleString("en-IN")}`}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Investment Breakdown Bar Chart */}
          <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-750 p-6 rounded-2xl lg:col-span-2 shadow-md">
            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Holdings Value vs Cost
            </h3>
            <div className="h-64 w-full">
              {barChartData.length === 0 ? (
                <p className="text-slate-500 text-sm">No data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff" }}
                      formatter={(val) => `₹${Number(val).toLocaleString("en-IN")}`}
                    />
                    <Legend />
                    <Bar dataKey="Invested" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Current" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Holdings List */}
      <div className="bg-slate-800/30 border border-slate-750 rounded-2xl p-6 mb-8 shadow-md">
        <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-indigo-400" />
          Consolidated Holdings
        </h3>

        {holdingsLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-slate-400 text-sm">Loading holdings...</p>
          </div>
        ) : holdings.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 text-sm mb-4">You do not have any active investment holdings.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-750 text-slate-400 font-semibold uppercase text-xs">
                  <th className="py-3 px-4">Asset</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Qty/Units</th>
                  <th className="py-3 px-4 text-right">Avg Price</th>
                  <th className="py-3 px-4 text-right">Total Cost</th>
                  <th className="py-3 px-4 text-right">Mkt Price</th>
                  <th className="py-3 px-4 text-right">Current Value</th>
                  <th className="py-3 px-4 text-right">P&L</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {holdings.map((h, index) => {
                  const profit = Number(h.unrealized_profit);
                  const isUp = profit >= 0;
                  const returnPct = Number(h.total_invested) > 0 ? (profit / Number(h.total_invested)) * 100 : 0;

                  // Find fund details for MF
                  let assetSymbol = h.symbol || `Asset #${h.asset_id}`;
                  let assetName = `Asset Reference #${h.asset_id}`;
                  if (h.asset_type === "MUTUAL_FUND") {
                    const fund = funds.find(f => f.fund_id === h.asset_id);
                    if (fund) {
                      assetSymbol = fund.symbol;
                      assetName = fund.name;
                    }
                  }

                  return (
                    <tr key={h.holding_id || index} className="hover:bg-slate-800/20 transition-all">
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-100">{assetSymbol}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[200px]" title={assetName}>{assetName}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded border ${h.asset_type === "STOCK" ? "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"}`}>
                          {h.asset_type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-slate-200">
                        {Number(h.quantity).toFixed(4)}
                      </td>
                      <td className="py-4 px-4 text-right text-slate-300">
                        ₹{Number(h.average_buy_price).toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right text-slate-300">
                        ₹{Number(h.total_invested).toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right text-slate-300">
                        ₹{Number(h.current_market_price).toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-slate-100">
                        ₹{Number(h.current_value).toFixed(2)}
                      </td>
                      <td className={`py-4 px-4 text-right font-bold ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                        <div>₹{profit.toFixed(2)}</div>
                        <div className="text-xs font-semibold">{isUp ? "+" : ""}{returnPct.toFixed(2)}%</div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {h.asset_type === "MUTUAL_FUND" ? (
                          <button
                            onClick={() => handleOpenRedeem(h)}
                            className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                          >
                            Redeem
                          </button>
                        ) : (
                          <span className="text-slate-600 text-xs italic">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Systematic Investment Plans (SIP) */}
      <div className="bg-slate-800/30 border border-slate-750 rounded-2xl p-6 shadow-md">
        <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          Active Systematic Investment Plans (SIP)
        </h3>

        {sipsLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-slate-400 text-sm">Loading sips...</p>
          </div>
        ) : sips.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 text-sm">You do not have any active SIP schedules.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-750 text-slate-400 font-semibold uppercase text-xs">
                  <th className="py-3 px-4">Fund Name</th>
                  <th className="py-3 px-4 text-right">Installment Amount</th>
                  <th className="py-3 px-4 text-center">Frequency</th>
                  <th className="py-3 px-4 text-center">Next Installment</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sips.map((sip) => (
                  <tr key={sip.sip_id} className="hover:bg-slate-800/20 transition-all">
                    <td className="py-4 px-4 font-bold text-slate-200">
                      {sip.fund_name} <span className="text-xs font-semibold text-indigo-400">({sip.fund_symbol})</span>
                    </td>
                    <td className="py-4 px-4 text-right font-black text-slate-100">
                      ₹{Number(sip.amount).toLocaleString("en-IN")}
                    </td>
                    <td className="py-4 px-4 text-center text-slate-400 text-xs">
                      {sip.frequency}
                    </td>
                    <td className="py-4 px-4 text-center text-slate-200 font-medium">
                      {new Date(sip.next_installment_date).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric"
                      })}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded ${getSipStatusBadge(sip.status)}`}>
                        {sip.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {sip.status !== "CANCELLED" ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleToggleSip(sip.sip_id, sip.status)}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                              sip.status === "ACTIVE"
                                ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border-emerald-500/20"
                            }`}
                            title={sip.status === "ACTIVE" ? "Pause Installments" : "Resume Installments"}
                          >
                            {sip.status === "ACTIVE" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            {sip.status === "ACTIVE" ? "Pause" : "Resume"}
                          </button>
                          <button
                            onClick={() => handleCancelSip(sip.sip_id)}
                            className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                            title="Cancel SIP Plan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Cancel Plan
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-650 text-xs italic">Closed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Redemption Modal */}
      {showRedeemModal && selectedHolding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-850 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-red-400" />
                Redeem Fund Units
              </h2>
              <button 
                onClick={() => setShowRedeemModal(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRedeemSubmit} className="p-6 space-y-4">
              {/* Status messages */}
              {successMsg && (
                <div className="flex items-center gap-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 p-4 rounded-xl text-sm animate-pulse">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="flex items-center gap-3 bg-red-500/10 text-red-400 border border-red-500/20 p-4 rounded-xl text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="bg-slate-800/20 border border-slate-800/50 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Mutual Fund</span>
                  <span className="font-bold text-white">{getFundName(selectedHolding.asset_id)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Total Held Units</span>
                  <span className="font-bold text-indigo-400">{Number(selectedHolding.quantity).toFixed(4)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Current NAV</span>
                  <span className="font-bold text-white">₹{Number(selectedHolding.current_market_price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Current Valuation</span>
                  <span className="font-bold text-emerald-400">₹{Number(selectedHolding.current_value).toFixed(2)}</span>
                </div>
              </div>

              {/* Units to Redeem */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">Units to Redeem</label>
                <input
                  type="number"
                  step="any"
                  value={redeemUnits}
                  onChange={(e) => setRedeemUnits(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-800 focus:border-red-500 rounded-xl px-4 py-2.5 text-sm text-white font-bold outline-none"
                  placeholder={`Max: ${selectedHolding.quantity}`}
                  required
                />
              </div>

              <div className="text-xs text-slate-500 flex items-start gap-1.5">
                <HelpCircle className="w-4 h-4 shrink-0 text-slate-400" />
                <p>Funds will be credited instantly back to your portfolio valuation metrics upon redemption processing.</p>
              </div>

              <button
                type="submit"
                disabled={redeemLoading}
                className="w-full bg-red-600 hover:bg-red-500 disabled:bg-slate-850 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-red-600/10 flex items-center justify-center gap-2 mt-4"
              >
                {redeemLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing Redemption...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Redeem Units
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

export default Portfolio;
