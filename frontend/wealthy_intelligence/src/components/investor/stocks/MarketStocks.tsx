const MarketStocks = ({
  stocks,

  selectedStock,

  setSelectedStock,
}: any) => {
  return (
    <div className="bg-white rounded-2xl shadow p-5 h-fit">
      {/* HEADER */}

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold">Market Watch</h2>

        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
          LIVE
        </span>
      </div>

      {/* STOCK LIST */}

      <div className="space-y-3">
        {stocks.map((stock: any) => {
          /*
            |--------------------------------------------------------------------------
            | CHANGE
            |--------------------------------------------------------------------------
            */

          const change = Number(stock.change_amount || 0);

          const isProfit = change >= 0;

          return (
            <div
              key={stock.stock_id}
              onClick={() => setSelectedStock(stock)}
              className={`border rounded-2xl p-4 cursor-pointer transition-all ${
                selectedStock?.stock_id === stock.stock_id
                  ? "border-green-500 bg-green-50"
                  : "hover:bg-slate-50"
              }`}
            >
              {/* TOP */}

              <div className="flex justify-between items-center">
                {/* LEFT */}

                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {stock.symbol}
                  </h3>

                  <p className="text-xs text-slate-400">{stock.exchange}</p>
                </div>

                {/* RIGHT */}

                <div className="text-right">
                  {/* PRICE */}

                  <p className="font-bold text-lg">
                    ₹{Number(stock.current_price).toLocaleString()}
                  </p>

                  {/* CHANGE */}

                  <p
                    className={`text-sm font-semibold ${
                      isProfit ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isProfit ? "+" : ""}₹{Math.abs(change).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarketStocks;
