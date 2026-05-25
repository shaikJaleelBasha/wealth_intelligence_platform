const InvestorDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">
        Investor Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold">Portfolio Value</h2>
          <p className="text-3xl font-bold mt-4">₹4.5L</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold">Profit</h2>
          <p className="text-3xl font-bold mt-4 text-green-600">₹80K</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold">Holdings</h2>
          <p className="text-3xl font-bold mt-4">14</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold">Transactions</h2>
          <p className="text-3xl font-bold mt-4">54</p>
        </div>
      </div>
    </div>
  );
};

export default InvestorDashboard;
