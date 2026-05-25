import { useEffect } from "react";
import { useStockStore } from "../../store/stockStore";

const ManageStocks = () => {
  const { stocks, fetchStocks } = useStockStore();

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Stocks</h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Symbol</th>
              <th className="p-4 text-left">Company</th>
              <th className="p-4 text-left">Sector</th>
              <th className="p-4 text-left">Price</th>
            </tr>
          </thead>

          <tbody>
            {stocks.map((stock: any) => (
              <tr key={stock.stock_id} className="border-t">
                <td className="p-4">{stock.symbol}</td>
                <td className="p-4">{stock.company_name}</td>
                <td className="p-4">{stock.sector}</td>
                <td className="p-4">₹{stock.current_price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageStocks;
