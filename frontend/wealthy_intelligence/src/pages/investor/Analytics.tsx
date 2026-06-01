const Analytics = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {/* STOCKS */}

      <div className="bg-white shadow rounded-2xl p-5">
        <p className="text-slate-400">Stocks</p>

        <h2 className="text-3xl font-bold">{stocks.length}</h2>
      </div>

      {/* HOLDINGS */}

      <div className="bg-white shadow rounded-2xl p-5">
        <p className="text-slate-400">Holdings</p>

        <h2 className="text-3xl font-bold">{holdings.length}</h2>
      </div>

      {/* TRANSACTIONS */}

      <div className="bg-white shadow rounded-2xl p-5">
        <p className="text-slate-400">Transactions</p>

        <h2 className="text-3xl font-bold">{transactions.length}</h2>
      </div>

      {/* PORTFOLIO VALUE */}

      <div className="bg-white shadow rounded-2xl p-5">
        <p className="text-slate-400">Portfolio Value</p>

        <h2 className="text-3xl font-bold text-green-600">
          ₹
          {holdings
            .reduce(
              (acc: number, item: any) => acc + Number(item.current_value),
              0,
            )
            .toLocaleString()}
        </h2>
      </div>
    </div>
  );
};

export default Analytics;
