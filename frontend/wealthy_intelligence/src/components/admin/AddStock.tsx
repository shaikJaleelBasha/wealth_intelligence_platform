import { useState } from "react";

import { useStockStore } from "../../store/stockStore";

const AddStock = () => {
  /*
  |--------------------------------------------------------------------------
  | ZUSTAND STORE
  |--------------------------------------------------------------------------
  */

  const { addStock } = useStockStore();

  /*
  |--------------------------------------------------------------------------
  | FORM STATE
  |--------------------------------------------------------------------------
  */

  const [formData, setFormData] = useState({
    symbol: "",

    company_name: "",

    exchange: "",

    sector: "",

    industry: "",

    isin_number: "",

    market_cap: "",

    current_price: "",
  });

  /*
  |--------------------------------------------------------------------------
  | AUTO QUANTITY
  |--------------------------------------------------------------------------
  */

  const calculatedQuantity = Math.floor(
    Number(formData.market_cap || 0) / Number(formData.current_price || 1),
  );

  /*
  |--------------------------------------------------------------------------
  | HANDLE SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addStock({
        ...formData,

        available_quantity: calculatedQuantity,
      });

      alert("Stock Added Successfully");

      setFormData({
        symbol: "",

        company_name: "",

        exchange: "",

        sector: "",

        industry: "",

        isin_number: "",

        market_cap: "",

        current_price: "",
      });
    } catch (error) {
      console.log(error);

      alert("Failed to add stock");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl p-6 md:p-8">
        {/* HEADER */}

        <div className="mb-6">
          <h1 className="text-4xl font-bold text-slate-900">Add Stock</h1>

          <p className="text-slate-500 mt-2">
            Create and manage stock listings.
          </p>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* SYMBOL */}

          <div>
            <label className="text-sm font-medium text-slate-600 mb-2 block">
              Stock Symbol
            </label>

            <input
              type="text"
              placeholder="Example: TCS"
              value={formData.symbol}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  symbol: e.target.value,
                })
              }
              className="w-full border border-slate-300 p-4 rounded-xl outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* COMPANY NAME */}

          <div>
            <label className="text-sm font-medium text-slate-600 mb-2 block">
              Company Name
            </label>

            <input
              type="text"
              placeholder="Example: Tata Consultancy Services"
              value={formData.company_name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  company_name: e.target.value,
                })
              }
              className="w-full border border-slate-300 p-4 rounded-xl outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* EXCHANGE */}

          <div>
            <label className="text-sm font-medium text-slate-600 mb-2 block">
              Exchange
            </label>

            <input
              type="text"
              placeholder="Example: NSE"
              value={formData.exchange}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  exchange: e.target.value,
                })
              }
              className="w-full border border-slate-300 p-4 rounded-xl outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* SECTOR */}

          <div>
            <label className="text-sm font-medium text-slate-600 mb-2 block">
              Sector
            </label>

            <input
              type="text"
              placeholder="Example: Information Technology"
              value={formData.sector}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sector: e.target.value,
                })
              }
              className="w-full border border-slate-300 p-4 rounded-xl outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* INDUSTRY */}

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-600 mb-2 block">
              Industry
            </label>

            <input
              type="text"
              placeholder="Example: Software Services"
              value={formData.industry}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  industry: e.target.value,
                })
              }
              className="w-full border border-slate-300 p-4 rounded-xl outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* ISIN */}

          <div>
            <label className="text-sm font-medium text-slate-600 mb-2 block">
              ISIN Number
            </label>

            <input
              type="text"
              placeholder="Example: INE467B01029"
              value={formData.isin_number}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isin_number: e.target.value,
                })
              }
              className="w-full border border-slate-300 p-4 rounded-xl outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* MARKET CAP */}

          <div>
            <label className="text-sm font-medium text-slate-600 mb-2 block">
              Market Capital
            </label>

            <input
              type="number"
              placeholder="Example: 500000000"
              value={formData.market_cap}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  market_cap: e.target.value,
                })
              }
              className="w-full border border-slate-300 p-4 rounded-xl outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* CURRENT PRICE */}

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-600 mb-2 block">
              Current Price
            </label>

            <input
              type="number"
              placeholder="Example: 3850"
              value={formData.current_price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  current_price: e.target.value,
                })
              }
              className="w-full border border-slate-300 p-4 rounded-xl outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* AUTO QUANTITY */}

          <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Auto Calculated Quantity
                </p>

                <h2 className="text-4xl font-bold text-blue-600 mt-2">
                  {calculatedQuantity}
                </h2>
              </div>

              <div className="text-right">
                <p className="text-sm text-slate-400">Formula</p>

                <p className="font-semibold text-slate-700">
                  MarketCap / CurrentPrice
                </p>
              </div>
            </div>
          </div>

          {/* BUTTON */}

          <button className="md:col-span-2 bg-slate-950 hover:bg-slate-800 transition-all text-white py-4 rounded-2xl font-semibold text-lg">
            ADD STOCK
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStock;
