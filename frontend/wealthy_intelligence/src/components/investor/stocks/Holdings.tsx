import { useEffect, useState } from "react";

const Holdings = () => {
  const [holdings, setHoldings] = useState([]);

  useEffect(() => {
    console.log("Fetching holdings...");
    // API call later
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-2xl font-bold mb-5">Your Holdings</h2>

      <table className="w-full">
        <thead>
          <tr className="bg-slate-100">
            <th className="p-4 text-left">Symbol</th>
            <th className="p-4 text-left">Qty</th>
            <th className="p-4 text-left">Avg Price</th>
            <th className="p-4 text-left">Value</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td className="p-4">TCS</td>
            <td className="p-4">15</td>
            <td className="p-4">₹3400</td>
            <td className="p-4 text-green-600">₹57,750</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Holdings;
