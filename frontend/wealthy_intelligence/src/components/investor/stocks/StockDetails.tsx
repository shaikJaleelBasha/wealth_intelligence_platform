const StockDetails = ({ stock }: any) => {
  /*
  |--------------------------------------------------------------------------
  | EMPTY
  |--------------------------------------------------------------------------
  */

  if (!stock) {
    return (
      <div className="bg-white rounded-2xl shadow p-10 text-center">
        <h2 className="text-3xl font-bold text-slate-700">Select a Stock</h2>

        <p className="text-slate-400 mt-3">Choose a stock from market watch.</p>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | CHANGE
  |--------------------------------------------------------------------------
  */

  const change = Number(stock.change_amount || 0);

  const isProfit = change >= 0;

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        {/* LEFT */}

        <div>
          {/* SYMBOL */}

          <h1 className="text-5xl font-bold text-slate-800">{stock.symbol}</h1>

          {/* COMPANY */}

          <p className="text-slate-500 text-lg mt-2">{stock.company_name}</p>

          {/* TAGS */}

          <div className="flex gap-3 mt-5 flex-wrap">
            <span className="bg-slate-100 px-4 py-2 rounded-full text-sm font-medium">
              {stock.exchange}
            </span>

            <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              {stock.sector}
            </span>

            <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
              {stock.industry}
            </span>
          </div>
        </div>

        {/* RIGHT */}

        <div className="text-right">
          {/* CURRENT PRICE */}

          <h2 className="text-5xl font-bold text-green-600">
            ₹{Number(stock.current_price).toLocaleString()}
          </h2>

          {/* CHANGE */}

          <p
            className={`mt-3 text-lg font-bold ${
              isProfit ? "text-green-600" : "text-red-600"
            }`}
          >
            {isProfit ? "+" : ""}₹{Math.abs(change).toLocaleString()}
          </p>
        </div>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
        {/* MARKET CAP */}

        <div className="bg-slate-50 rounded-2xl p-5">
          <p className="text-slate-400 text-sm">Market Cap</p>

          <h3 className="text-2xl font-bold mt-3">
            ₹{Number(stock.market_cap).toLocaleString()}
          </h3>
        </div>

        {/* AVAILABLE */}

        <div className="bg-slate-50 rounded-2xl p-5">
          <p className="text-slate-400 text-sm">Available Qty</p>

          <h3 className="text-2xl font-bold mt-3">
            {stock.available_quantity}
          </h3>
        </div>

        {/* INDUSTRY */}

        <div className="bg-slate-50 rounded-2xl p-5">
          <p className="text-slate-400 text-sm">Industry</p>

          <h3 className="text-xl font-bold mt-3">{stock.industry}</h3>
        </div>

        {/* ISIN */}

        <div className="bg-slate-50 rounded-2xl p-5">
          <p className="text-slate-400 text-sm">ISIN Number</p>

          <h3 className="text-sm font-bold mt-3 break-all">
            {stock.isin_number}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default StockDetails;
