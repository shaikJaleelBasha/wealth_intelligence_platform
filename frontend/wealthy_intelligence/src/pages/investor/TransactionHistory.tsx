import { useEffect, useState } from "react";
import { useTransactionStore } from "../../store/transactionStore";
import { useMutualFundStore } from "../../store/mutualFundStore";
import { 
  TrendingUp, Wallet, Sparkles, Loader2, CheckCircle2, RefreshCw 
} from "lucide-react";

const TransactionHistory = () => {
  const { transactions: stockTransactions, fetchTransactions: fetchStockTransactions, loading: stockLoading } = useTransactionStore();
  const { transactions: mfTransactions, fetchTransactions: fetchMfTransactions, loading: mfLoading } = useMutualFundStore();

  const [activeTab, setActiveTab] = useState<"STOCKS" | "MUTUAL_FUNDS">("STOCKS");

  useEffect(() => {
    fetchStockTransactions();
    fetchMfTransactions();
  }, [fetchStockTransactions, fetchMfTransactions]);

  const handleRefresh = () => {
    fetchStockTransactions();
    fetchMfTransactions();
  };

  const getTransactionTypeBadge = (type: string) => {
    const t = type.toUpperCase();
    if (t === "BUY") {
      return "text-emerald-455 bg-emerald-500/10 border-emerald-500/20";
    }
    if (t === "SELL") {
      return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    }
    return "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"; // SIP_INSTALLMENT
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === "COMPLETED" || s === "SUCCESS") {
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    }
    if (s === "PENDING") {
      return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    }
    return "text-red-400 bg-red-500/10 border-red-500/20";
  };

  // Aggregated Summary Statistics
  const totalStockVol = stockTransactions.reduce((sum, t) => sum + Number(t.total_amount || 0), 0);
  const totalMfVol = mfTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalOrders = stockTransactions.length + mfTransactions.length;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span>Consolidated Order Logs</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Transaction History
          </h1>
          <p className="text-slate-400 mt-2">
            View details of all your stocks trading orders and mutual funds SIP investments.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/50 py-2.5 px-4 rounded-xl text-xs transition font-semibold shadow"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Activity
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">Total Completed Orders</span>
            <span className="text-2xl font-black text-white mt-1 block">{totalOrders} transactions</span>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">Stock Trade Volume</span>
            <span className="text-2xl font-black text-white mt-1 block">
              ₹{totalStockVol.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">Mutual Fund Volume</span>
            <span className="text-2xl font-black text-white mt-1 block">
              ₹{totalMfVol.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main tab table */}
      <div className="bg-slate-800/30 border border-slate-750 rounded-3xl p-6 shadow-md flex flex-col">
        
        {/* Tabs Switch */}
        <div className="flex gap-2 border-b border-slate-700/60 pb-3 mb-6">
          <button
            onClick={() => setActiveTab("STOCKS")}
            className={`py-2 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === "STOCKS" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15" : "text-slate-400 hover:text-slate-200"}`}
          >
            Stock Trades
          </button>
          <button
            onClick={() => setActiveTab("MUTUAL_FUNDS")}
            className={`py-2 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === "MUTUAL_FUNDS" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15" : "text-slate-400 hover:text-slate-200"}`}
          >
            Mutual Fund & SIP Orders
          </button>
        </div>

        {/* STOCKS TABLE */}
        {activeTab === "STOCKS" && (
          stockLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-slate-400 text-xs">Streaming stock orders...</p>
            </div>
          ) : stockTransactions.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm italic">
              You do not have any stock transaction history.
            </div>
          ) : (
            <div className="overflow-x-auto pr-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-750 text-slate-500 font-semibold uppercase">
                    <th className="py-2.5 px-3">Stock Symbol</th>
                    <th className="py-2.5 px-3">Transaction Type</th>
                    <th className="py-2.5 px-3 text-right">Quantity</th>
                    <th className="py-2.5 px-3 text-right">Price per Share</th>
                    <th className="py-2.5 px-3 text-right">Total Amount</th>
                    <th className="py-2.5 px-3 text-center">Execution Date</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {stockTransactions.map((t, idx) => (
                    <tr key={t.transaction_id || idx} className="hover:bg-slate-800/10 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-200">{t.symbol}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{t.company_name}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded border ${getTransactionTypeBadge(t.transaction_type)}`}>
                          {t.transaction_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-semibold text-slate-200">
                        {Number(t.quantity).toFixed(0)}
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-350">
                        ₹{Number(t.price_per_share).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-slate-100">
                        ₹{Number(t.total_amount).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 text-center font-medium text-slate-300">
                        {new Date(t.transaction_date).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded border ${getStatusBadge(t.order_status)}`}>
                          {t.order_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* MUTUAL FUNDS TABLE */}
        {activeTab === "MUTUAL_FUNDS" && (
          mfLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-slate-400 text-xs">Streaming mutual fund orders...</p>
            </div>
          ) : mfTransactions.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm italic">
              You do not have any mutual fund order history.
            </div>
          ) : (
            <div className="overflow-x-auto pr-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-750 text-slate-500 font-semibold uppercase">
                    <th className="py-2.5 px-3">Mutual Fund</th>
                    <th className="py-2.5 px-3">Order Type</th>
                    <th className="py-2.5 px-3 text-right">units allocated</th>
                    <th className="py-2.5 px-3 text-right">NAV at Transaction</th>
                    <th className="py-2.5 px-3 text-right">Total Amount</th>
                    <th className="py-2.5 px-3 text-center">Transaction Date</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {mfTransactions.map((t, idx) => (
                    <tr key={t.transaction_id || idx} className="hover:bg-slate-800/10 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-200">{t.fund_symbol}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{t.fund_name}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded border ${getTransactionTypeBadge(t.transaction_type)}`}>
                          {t.transaction_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-semibold text-slate-200">
                        {Number(t.units).toFixed(4)}
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-350">
                        ₹{Number(t.nav_at_transaction).toFixed(4)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-slate-100">
                        ₹{Number(t.amount).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 text-center font-medium text-slate-300">
                        {new Date(t.transaction_date).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded border ${getStatusBadge(t.status)}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

      </div>
    </div>
  );
};

export default TransactionHistory;
