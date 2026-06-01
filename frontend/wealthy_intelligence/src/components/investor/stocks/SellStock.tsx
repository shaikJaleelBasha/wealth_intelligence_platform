import { useMemo } from "react";

const SellStock = ({
  stock,
  quantity,
  setQuantity,
  handleSell,
  holding,
}: any) => {
  /*
  |--------------------------------------------------------------------------
  | NO STOCK
  |--------------------------------------------------------------------------
  */

  if (!stock) {
    return (
      <div className="bg-white rounded-2xl shadow p-6">
        <p className="text-slate-500">Select a stock to sell</p>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | HOLDING INFO
  |--------------------------------------------------------------------------
  */

  const ownedQuantity = Number(holding?.quantity || 0);

  const avgBuyPrice = Number(holding?.average_buy_price || 0);

  const currentPrice = Number(stock.current_price || 0);

  /*
  |--------------------------------------------------------------------------
  | SELL CALCULATIONS
  |--------------------------------------------------------------------------
  */

  const sellQty = Number(quantity || 0);

  const estimatedValue = sellQty * currentPrice;

  const estimatedProfit = (currentPrice - avgBuyPrice) * sellQty;

  const canSell = sellQty > 0 && sellQty <= ownedQuantity;

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* HEADER */}

      <h2 className="text-2xl font-bold text-red-600 mb-5">Sell Stock</h2>

      {/* SYMBOL */}

      <input
        value={stock.symbol}
        readOnly
        className="w-full border p-3 rounded-xl bg-slate-100 mb-4"
      />

      {/* ISIN */}

      <input
        value={stock.isin_number}
        readOnly
        className="w-full border p-3 rounded-xl bg-slate-100 mb-4"
      />

      {/* CURRENT PRICE */}

      <input
        value={`₹${currentPrice.toLocaleString()}`}
        readOnly
        className="w-full border p-3 rounded-xl bg-slate-100 mb-4"
      />

      {/* OWNED */}

      <div className="bg-slate-50 rounded-xl p-3 mb-4">
        <p className="text-sm text-slate-500">Owned Shares</p>

        <h3 className="text-xl font-bold">{ownedQuantity}</h3>
      </div>

      {/* AVG BUY */}

      <div className="bg-slate-50 rounded-xl p-3 mb-4">
        <p className="text-sm text-slate-500">Avg Buy Price</p>

        <h3 className="text-xl font-bold">₹{avgBuyPrice.toLocaleString()}</h3>
      </div>

      {/* SELL QTY */}

      <input
        type="number"
        placeholder="Quantity to Sell"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="w-full border p-3 rounded-xl mb-4"
      />

      {/* VALIDATION */}

      {sellQty > ownedQuantity && (
        <p className="text-red-600 text-sm mb-4">
          You only own {ownedQuantity} shares.
        </p>
      )}

      {/* ESTIMATED VALUE */}

      <div className="bg-slate-50 rounded-xl p-4 mb-3">
        <p className="text-sm text-slate-500">Estimated Sell Value</p>

        <h3 className="text-xl font-bold">
          ₹{estimatedValue.toLocaleString()}
        </h3>
      </div>

      {/* PROFIT LOSS */}

      <div className="bg-slate-50 rounded-xl p-4 mb-5">
        <p className="text-sm text-slate-500">Estimated Profit / Loss</p>

        <h3
          className={`text-xl font-bold ${
            estimatedProfit >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          ₹{estimatedProfit.toLocaleString()}
        </h3>
      </div>

      {/* BUTTON */}

      <button
        disabled={!canSell}
        onClick={handleSell}
        className={`w-full py-3 rounded-xl text-white font-semibold ${
          canSell
            ? "bg-red-600 hover:bg-red-700"
            : "bg-slate-400 cursor-not-allowed"
        }`}
      >
        Sell Now
      </button>
    </div>
  );
};

export default SellStock;
