

const AdminDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded shadow">Total Investors</div>

        <div className="bg-white p-5 rounded shadow">Total Stocks</div>

        <div className="bg-white p-5 rounded shadow">Mutual Funds</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
