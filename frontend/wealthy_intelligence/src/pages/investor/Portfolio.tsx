const Portfolio = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Portfolio</h1>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Growth Portfolio</h2>

        <p>Total Investment: ₹3,00,000</p>
        <p>Current Value: ₹4,20,000</p>
        <p className="text-green-600 font-semibold">Profit: ₹1,20,000</p>
      </div>
    </div>
  );
};

export default Portfolio;
