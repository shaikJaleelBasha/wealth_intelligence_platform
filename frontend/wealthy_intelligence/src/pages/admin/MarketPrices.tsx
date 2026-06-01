import { useEffect, useState } from "react";
import { useStockStore } from "../../store/stockStore";
import { Sparkles, DollarSign, RefreshCw, Loader2, Play } from "lucide-react";

const MarketPrices = () => {
  const { stocks, fetchStocks, updateStock, loading } = useStockStore();
  const [prices, setPrices] = useState<Record<number, string>>({});
  const [updating, setUpdating] = useState<Record<number, boolean>>({});
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  useEffect(() => {
    const p: Record<number, string> = {};
    stocks.forEach((s: any) => {
      p[s.stock_id] = s.current_price.toString();
    });
    setPrices(p);
  }, [stocks]);

  const handlePriceChange = (stockId: number, val: string) => {
    setPrices((prev) => ({
      ...prev,
      [stockId]: val,
    }));
  };

  const handleSingleUpdate = async (stockId: number, symbol: string) => {
    const newPrice = Number(prices[stockId]);
    if (isNaN(newPrice) || newPrice <= 0) {
      alert("Invalid price parameter");
      return;
    }

    setUpdating((prev) => ({ ...prev, [stockId]: true }));
    try {
      await updateStock(stockId, { current_price: newPrice });
      const time = new Date().toLocaleTimeString();
      setSimulationLog((prev) => [`[${time}] Manual Adjustment: ${symbol} set to ₹${newPrice}`, ...prev].slice(0, 15));
    } catch (error) {
      console.error(error);
      alert("Failed to update market price");
    } finally {
      setUpdating((prev) => ({ ...prev, [stockId]: false }));
    }
  };

  const runSimulation = async () => {
    if (stocks.length === 0) return;
    setSimulationActive(true);
    const time = new Date().toLocaleTimeString();
    setSimulationLog((prev) => [`[${time}] Initiating Market Volatility Simulation...`, ...prev]);

    try {
      for (const stock of stocks) {
        const deltaPercent = (Math.random() * 8 - 4) / 100;
        const currentPrice = Number(stock.current_price);
        const nextPrice = Number((currentPrice * (1 + deltaPercent)).toFixed(2));

        const timeString = new Date().toLocaleTimeString();
        const direction = deltaPercent >= 0 ? "▲ GAIN" : "▼ LOSS";
        
        await updateStock(stock.stock_id, { current_price: nextPrice });
        
        setSimulationLog((prev) => [
          `[${timeString}] ${stock.symbol} ${direction}: ₹${currentPrice} → ₹${nextPrice} (${(deltaPercent * 100).toFixed(2)}%)`,
          ...prev
        ].slice(0, 15));
        
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
      
      const endTime = new Date().toLocaleTimeString();
      setSimulationLog((prev) => [`[${endTime}] Volatility Simulation complete.`, ...prev]);
    } catch (error) {
      console.error(error);
    } finally {
      setSimulationActive(false);
      fetchStocks();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 relative overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Glow backgrounds */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-indigo-650/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-violet-650/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span>Exchange Orderbook and Feeds Control</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Market Price Management
          </h1>
          <p className="text-slate-400 mt-2">
            Configure live index price valuations, trigger artificial exchange volatility events, and simulate portfolio tick telemetry.
          </p>
        </div>

        <button
          onClick={runSimulation}
          disabled={simulationActive || loading}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-800 disabled:to-slate-800 disabled:opacity-50 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-indigo-650/15 transition-all text-xs uppercase tracking-wider self-start md:self-center cursor-pointer"
        >
          {simulationActive ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Simulating Volatility...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-emerald-450 animate-pulse" />
              Trigger Volatility Event
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Price Feeds Console */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
              <DollarSign className="text-indigo-400 w-5 h-5" />
              Live Securities Pricing Ledger
            </h2>

            <div className="space-y-4">
              {loading && stocks.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                  Accessing securities ledger...
                </div>
              ) : (
                stocks.map((stock: any) => {
                  const val = prices[stock.stock_id] || "";
                  const isChanging = updating[stock.stock_id] || false;
                  
                  return (
                    <div
                      key={stock.stock_id}
                      className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-slate-800 transition"
                    >
                      <div className="flex items-center gap-4">
                        <span className="inline-block px-2.5 py-1 text-[10px] font-bold bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20 uppercase">
                          {stock.symbol}
                        </span>
                        <div>
                          <h4 className="font-extrabold text-slate-100">{stock.company_name}</h4>
                          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{stock.isin_number} • {stock.exchange}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₹</span>
                          <input
                            type="number"
                            value={val}
                            onChange={(e) => handlePriceChange(stock.stock_id, e.target.value)}
                            className="w-32 pl-7 pr-3 py-1.5 text-xs bg-slate-950/60 border border-slate-800 focus:border-indigo-500 rounded-lg outline-none text-white font-bold"
                          />
                        </div>

                        <button
                          onClick={() => handleSingleUpdate(stock.stock_id, stock.symbol)}
                          disabled={isChanging}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-[10px] uppercase tracking-wider transition disabled:opacity-50 cursor-pointer"
                        >
                          {isChanging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Commit"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Live Simulation Logs */}
        <div className="space-y-6">
          <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-xl h-[600px] flex flex-col">
            <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
              <RefreshCw className={`text-indigo-400 w-5 h-5 ${simulationActive ? "animate-spin" : ""}`} />
              Volatility Telemetry Logs
            </h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-4 border-b border-slate-800 pb-3">
              Orderbook Tick Telemetry Feed
            </p>

            <div className="flex-grow overflow-y-auto space-y-2.5 font-mono text-[10px] text-slate-400 pr-1 select-none">
              {simulationLog.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-slate-600 px-4">
                  Telemetry idle. Trigger volatility to feed ledger ticks.
                </div>
              ) : (
                simulationLog.map((log, index) => {
                  let logColor = "text-slate-400";
                  if (log.includes("GAIN")) logColor = "text-emerald-450 font-semibold";
                  if (log.includes("LOSS")) logColor = "text-red-450 font-semibold";
                  if (log.includes("Initiating") || log.includes("complete")) logColor = "text-indigo-400 font-bold";

                  return (
                    <div key={index} className={`p-2 bg-slate-950/50 border border-slate-900/50 rounded-lg ${logColor}`}>
                      {log}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MarketPrices;
