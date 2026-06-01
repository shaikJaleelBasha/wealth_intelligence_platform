import { useEffect, useState } from "react";
import { useStockStore } from "../../store/stockStore";
import { Plus, Edit3, Trash2, Sparkles, Loader2, Search } from "lucide-react";
import { Link } from "react-router-dom";

const ManageStocks = () => {
  const { stocks, fetchStocks, updateStock, deleteStock, loading } = useStockStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStock, setSelectedStock] = useState<any | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [editPrice, setEditPrice] = useState("");
  const [editSector, setEditSector] = useState("");
  const [editIndustry, setEditIndustry] = useState("");
  const [editExchange, setEditExchange] = useState("");

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  const handleEditClick = (stock: any) => {
    setSelectedStock(stock);
    setEditPrice(stock.current_price.toString());
    setEditSector(stock.sector || "");
    setEditIndustry(stock.industry || "");
    setEditExchange(stock.exchange || "NSE");
    setEditMode(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock) return;
    setActionLoading(true);

    try {
      await updateStock(selectedStock.stock_id, {
        ...selectedStock,
        current_price: Number(editPrice),
        sector: editSector,
        industry: editIndustry,
        exchange: editExchange,
      });
      setEditMode(false);
      setSelectedStock(null);
    } catch (error) {
      console.error(error);
      alert("Failed to update stock");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = async (stockId: number, symbol: string) => {
    const confirmDelete = window.confirm(`Are you absolutely sure you want to delete ${symbol} from the active index? This cannot be undone!`);
    if (!confirmDelete) return;

    try {
      await deleteStock(stockId);
    } catch (error) {
      console.error(error);
      alert("Failed to delete stock");
    }
  };

  const filteredStocks = stocks.filter(
    (stock: any) =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 relative overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Glow backgrounds */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-indigo-650/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-violet-650/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span>Exchange Index Administration</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Manage Equity Listings
          </h1>
          <p className="text-slate-400 mt-2">
            Configure listed securities parameters, adjust active sectors, or initialize new equity tokens.
          </p>
        </div>

        <Link
          to="/admin/stocks/add"
          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-650/15 transition-all text-xs uppercase tracking-wider self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          Add New Security
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative z-10 max-w-md">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search listed symbols or companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-900/40 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-white transition placeholder:text-slate-650 font-medium"
          />
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/40 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4 pl-6">Symbol</th>
                <th className="p-4">Issuer Company</th>
                <th className="p-4">Exchange</th>
                <th className="p-4">Sector / Industry</th>
                <th className="p-4 text-right">Current Price</th>
                <th className="p-4 text-right">Available Qty</th>
                <th className="p-4 text-center pr-6">Cabinet Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60 text-xs font-semibold">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                    Fetching index catalog...
                  </td>
                </tr>
              ) : filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    No active listings matched the search parameters.
                  </td>
                </tr>
              ) : (
                filteredStocks.map((stock: any) => (
                  <tr key={stock.stock_id} className="hover:bg-slate-900/20 transition-all">
                    <td className="p-4 pl-6">
                      <span className="inline-block px-2.5 py-1 text-[10px] font-bold bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20 uppercase">
                        {stock.symbol}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-extrabold text-slate-100">{stock.company_name}</div>
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5">{stock.isin_number}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800 uppercase">
                        {stock.exchange}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-350">{stock.sector}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-medium">{stock.industry}</div>
                    </td>
                    <td className="p-4 text-right font-black text-slate-100">
                      ₹{Number(stock.current_price).toLocaleString()}
                    </td>
                    <td className="p-4 text-right text-slate-400 font-medium">
                      {Number(stock.available_quantity || 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-center pr-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(stock)}
                          className="p-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg transition border border-indigo-500/20 cursor-pointer"
                          title="Modify parameters"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(stock.stock_id, stock.symbol)}
                          className="p-2 bg-red-500/10 text-red-400 hover:bg-red-650 hover:text-white rounded-lg transition border border-red-500/20 cursor-pointer"
                          title="Expunge security"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editMode && selectedStock && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl relative">
            <h2 className="text-2xl font-bold text-slate-100 mb-2 flex items-center gap-2">
              <Edit3 className="text-indigo-400 w-5 h-5" />
              Adjust Listing Parameters
            </h2>
            <p className="text-slate-500 text-xs mb-6">
              Amending properties for <span className="text-indigo-400 font-bold">{selectedStock.symbol}</span> index token.
            </p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Exchange Price (INR)</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950/60 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-white font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Industrial Sector</label>
                <input
                  type="text"
                  value={editSector}
                  onChange={(e) => setEditSector(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950/60 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-white font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Industry Details</label>
                <input
                  type="text"
                  value={editIndustry}
                  onChange={(e) => setEditIndustry(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950/60 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-white font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Listing Exchange</label>
                <select
                  value={editExchange}
                  onChange={(e) => setEditExchange(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none cursor-pointer"
                >
                  <option value="NSE">NSE</option>
                  <option value="BSE">BSE</option>
                  <option value="NASDAQ">NASDAQ</option>
                  <option value="NYSE">NYSE</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setSelectedStock(null);
                  }}
                  className="w-1/2 border border-slate-850 hover:bg-slate-850 text-slate-400 font-semibold py-2 rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-1/2 bg-indigo-650 hover:bg-indigo-550 text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Commiting...
                    </>
                  ) : (
                    <span>Commit Settings</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStocks;
