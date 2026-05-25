const StockDetails = ({ stock }: any) => {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">{stock?.symbol}</h2>

          <p className="text-slate-500">{stock?.company_name}</p>
        </div>

        <div>
          <p className="text-3xl font-bold text-green-600">
            ₹{stock?.current_price}
          </p>
        </div>
      </div>

      {/* GRAPH AREA */}

      <div className="bg-slate-100 rounded-2xl h-96 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-3">Stock Analytics</h3>

          <p className="text-slate-500">
            Candle charts, technical indicators and AI insights appear here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StockDetails;
