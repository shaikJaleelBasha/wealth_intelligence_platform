const InvestorDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Investor Dashboard</h1>

      <div className="grid grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded shadow">Portfolio Value</div>

        <div className="bg-white p-5 rounded shadow">Stock Holdings</div>

        <div className="bg-white p-5 rounded shadow">Profit & Loss</div>
      </div>
    </div>
  );
};

export default InvestorDashboard;
