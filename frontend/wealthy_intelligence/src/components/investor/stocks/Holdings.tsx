import { useEffect } from "react";

import { useHoldingStore } from "../../../store/holdingStore";

const Holdings = () => {
  /*
  |--------------------------------------------------------------------------
  | ZUSTAND STORE
  |--------------------------------------------------------------------------
  */

  const { holdings, loading, fetchHoldings } = useHoldingStore();

  /*
  |--------------------------------------------------------------------------
  | FETCH HOLDINGS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchHoldings();
  }, [fetchHoldings]);

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-bold">Loading Holdings...</h2>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* HEADER */}

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold">Your Holdings</h2>

        <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-semibold">
          {holdings.length} Holdings
        </span>
      </div>

      {/* EMPTY */}

      {holdings.length === 0 ? (
        <div className="text-center py-10">
          <h3 className="text-xl font-semibold text-slate-600">
            No Holdings Found
          </h3>

          <p className="text-slate-400 mt-2">Buy stocks to create holdings.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* TABLE HEADER */}

            <thead>
              <tr className="bg-slate-100">
                <th className="p-4 text-left">Symbol</th>

                <th className="p-4 text-left">Company</th>

                <th className="p-4 text-left">Quantity</th>

                <th className="p-4 text-left">Avg Price</th>

                <th className="p-4 text-left">Current Price</th>

                <th className="p-4 text-left">Investment</th>

                <th className="p-4 text-left">Current Value</th>

                <th className="p-4 text-left">Profit / Loss</th>

                <th className="p-4 text-left">Profit %</th>
              </tr>
            </thead>

            {/* TABLE BODY */}

            <tbody>
              {holdings.map((holding: any) => (
                <tr
                  key={holding.holding_id}
                  className="border-b hover:bg-slate-50 transition"
                >
                  {/* SYMBOL */}

                  <td className="p-4 font-bold text-slate-800">
                    {holding.symbol}
                  </td>

                  {/* COMPANY */}

                  <td className="p-4 text-slate-600">{holding.company_name}</td>

                  {/* QUANTITY */}

                  <td className="p-4">{holding.quantity}</td>

                  {/* AVG BUY PRICE */}

                  <td className="p-4">
                    ₹{Number(holding.average_buy_price || 0).toLocaleString()}
                  </td>

                  {/* CURRENT MARKET PRICE */}

                  <td className="p-4">
                    ₹
                    {Number(holding.current_market_price || 0).toLocaleString()}
                  </td>

                  {/* TOTAL INVESTMENT */}

                  <td className="p-4">
                    ₹{Number(holding.total_invested || 0).toLocaleString()}
                  </td>

                  {/* CURRENT VALUE */}

                  <td className="p-4 font-semibold">
                    ₹{Number(holding.current_value || 0).toLocaleString()}
                  </td>

                  {/* PROFIT LOSS */}

                  <td
                    className={`p-4 font-bold ${
                      Number(holding.unrealized_profit || 0) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    ₹{Number(holding.unrealized_profit || 0).toLocaleString()}
                  </td>

                  {/* PROFIT LOSS % */}

                  <td
                    className={`p-4 font-bold ${
                      Number(holding.profit_loss_percentage || 0) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {Number(holding.profit_loss_percentage || 0).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Holdings;
