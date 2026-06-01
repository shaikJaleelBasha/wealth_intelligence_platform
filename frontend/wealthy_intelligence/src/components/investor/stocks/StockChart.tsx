import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const StockChart = ({
  history,

  stock,
}: any) => {
  /*
  |--------------------------------------------------------------------------
  | EMPTY
  |--------------------------------------------------------------------------
  */

  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-10 text-center">
        <h2 className="text-2xl font-bold">No Graph Data</h2>

        <p className="text-slate-500 mt-2">Waiting for market updates...</p>
      </div>
    );
  }

  console.log("GRAPH HISTORY:", history);

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* HEADER */}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold">{stock?.symbol} Analytics</h2>

          <p className="text-slate-500 mt-2">Historical market trend</p>
        </div>

        <div>
          <h2 className="text-5xl font-bold text-green-600">
            ₹{Number(stock?.current_price).toLocaleString()}
          </h2>
        </div>
      </div>

      {/* GRAPH */}

      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            {/* GRID */}

            <CartesianGrid strokeDasharray="3 3" />

            {/* X AXIS */}

            <XAxis dataKey="date" />

            {/* Y AXIS */}

            <YAxis />

            {/* TOOLTIP */}

            <Tooltip />

            {/* LINE */}

            <Line
              type="monotone"
              dataKey="price"
              stroke="#16a34a"
              strokeWidth={4}
              dot={false}
              activeDot={{
                r: 8,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockChart;
