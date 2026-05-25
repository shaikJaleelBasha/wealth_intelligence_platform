const SellStock = ({
  stock,

  quantity,

  setQuantity,

  handleSell,
}: any) => {
  /*
  |--------------------------------------------------------------------------
  | LOADING STATE
  |--------------------------------------------------------------------------
  */

  if (!stock) {
    return (
      <div className="bg-white rounded-2xl shadow p-6">
        <p className="text-slate-500">Loading stock...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-2xl font-bold text-red-600 mb-5">Sell Stock</h2>

      {/* STOCK */}

      <input
        value={stock?.symbol || ""}
        readOnly
        className="w-full border p-3 rounded-xl bg-slate-100 mb-4"
      />

      {/* PRICE */}

      <input
        value={`₹${stock?.current_price || 0}`}
        readOnly
        className="w-full border p-3 rounded-xl bg-slate-100 mb-4"
      />

      {/* QUANTITY */}

      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="w-full border p-3 rounded-xl mb-4"
      />

      {/* BUTTON */}

      <button
        onClick={handleSell}
        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl"
      >
        Sell Now
      </button>
    </div>
  );
};

export default SellStock;
