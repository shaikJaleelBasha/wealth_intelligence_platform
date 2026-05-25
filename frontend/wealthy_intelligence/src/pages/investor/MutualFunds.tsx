const MutualFunds = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Mutual Funds</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold">SBI Bluechip Fund</h2>

          <p className="mt-4">NAV: ₹85</p>

          <button className="mt-5 bg-slate-900 text-white px-5 py-2 rounded">
            Invest
          </button>
        </div>
      </div>
    </div>
  );
};

export default MutualFunds;
