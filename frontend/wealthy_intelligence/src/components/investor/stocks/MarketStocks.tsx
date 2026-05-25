const MarketStocks = ({
  stocks,

  selectedStock,

  setSelectedStock,
}: any) => {
  return (
    <div className="bg-white rounded-2xl shadow p-5 h-fit">
      {/* HEADER */}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Market Stocks</h2>

        <p className="text-slate-500 text-sm mt-1">
          Live stock market watchlist
        </p>
      </div>

      {/* STOCK LIST */}

      <div className="space-y-4 max-h-[750px] overflow-y-auto pr-2">
        {stocks.map((stock: any) => (
          <div
            key={stock.stock_id}
            onClick={() => setSelectedStock(stock)}
            className={`border rounded-2xl p-5 cursor-pointer transition-all ${
              selectedStock?.stock_id === stock.stock_id
                ? "border-green-500 bg-green-50 shadow-md"
                : "hover:bg-slate-50"
            }`}
          >
            {/* TOP */}

            <div className="flex items-start justify-between mb-4">
              {/* LEFT */}

              <div>
                <h3 className="font-bold text-xl text-slate-800">
                  {stock.symbol}
                </h3>

                <p className="text-sm text-slate-500">{stock.company_name}</p>
              </div>

              {/* RIGHT */}

              <div className="text-right">
                <p className="text-2xl font-bold text-slate-800">
                  ₹{stock.current_price}
                </p>

                <p className="text-green-600 text-sm font-medium">LIVE</p>
              </div>
            </div>

            {/* MARKET INFO */}

            <div className="grid grid-cols-2 gap-4 text-sm">
              {/* EXCHANGE */}

              <div>
                <p className="text-slate-400">Exchange</p>

                <p className="font-semibold">{stock.exchange}</p>
              </div>

              {/* SECTOR */}

              <div>
                <p className="text-slate-400">Sector</p>

                <p className="font-semibold">{stock.sector}</p>
              </div>

              {/* QUANTITY */}

              <div>
                <p className="text-slate-400">Available Qty</p>

                <p className="font-semibold text-blue-600">
                  {stock.available_quantity}
                </p>
              </div>

              {/* MARKET CAP */}

              <div>
                <p className="text-slate-400">Market Cap</p>

                <p className="font-semibold">₹{stock.market_cap}</p>
              </div>
            </div>

            {/* ISIN */}

            <div className="mt-4">
              <p className="text-slate-400 text-xs">ISIN NUMBER</p>

              <p className="font-mono text-sm text-slate-700">
                {stock.isin_number}
              </p>
            </div>

            {/* STATUS */}

            <div className="mt-4 flex items-center justify-between">
              <div
                className={`text-xs px-3 py-1 rounded-full ${
                  stock.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {stock.is_active ? "ACTIVE" : "INACTIVE"}
              </div>

              <div className="text-xs text-slate-400">
                Stock ID: {stock.stock_id}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketStocks;
