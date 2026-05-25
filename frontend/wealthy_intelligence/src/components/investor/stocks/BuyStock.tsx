const BuyStock = ({
  stock,

  quantity,

  setQuantity,

  handleBuy,
}: any) => {
  if (!stock) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-2xl font-bold text-green-600 mb-5">Buy Stock</h2>

      <input
        value={stock.symbol}
        readOnly
        className="w-full border p-3 rounded-xl bg-slate-100 mb-4"
      />

      <input
        value={stock.isin_number}
        readOnly
        className="w-full border p-3 rounded-xl bg-slate-100 mb-4"
      />

      <input
        value={`₹${stock.current_price}`}
        readOnly
        className="w-full border p-3 rounded-xl bg-slate-100 mb-4"
      />

      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="w-full border p-3 rounded-xl mb-4"
      />

      <div className="mb-4 text-sm text-slate-500">
        Available Quantity: {stock.available_quantity}
      </div>

      <button
        onClick={handleBuy}
        className="w-full bg-green-600 text-white py-3 rounded-xl"
      >
        Buy Now
      </button>
    </div>
  );
};

export default BuyStock;
