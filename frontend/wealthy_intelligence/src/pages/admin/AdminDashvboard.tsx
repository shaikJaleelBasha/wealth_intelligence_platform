const AdminDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold">Total Investors</h2>
          <p className="text-3xl font-bold mt-4">120</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold">Total Stocks</h2>
          <p className="text-3xl font-bold mt-4">58</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold">Transactions</h2>
          <p className="text-3xl font-bold mt-4">430</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold">Market Value</h2>
          <p className="text-3xl font-bold mt-4">₹12Cr</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
