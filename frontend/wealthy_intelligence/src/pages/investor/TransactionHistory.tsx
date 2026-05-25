import { useEffect } from "react";

import { useTransactionStore } from "../../store/transactionStore";

const TransactionHistory = () => {
  const { transactions, fetchTransactions } = useTransactionStore();

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Transaction History</h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">Quantity</th>
              <th className="p-4 text-left">Amount</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((transaction: any) => (
              <tr key={transaction.transaction_id} className="border-t">
                <td className="p-4">{transaction.transaction_type}</td>

                <td className="p-4">{transaction.quantity}</td>

                <td className="p-4">₹{transaction.total_amount}</td>

                <td className="p-4">{transaction.order_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;
