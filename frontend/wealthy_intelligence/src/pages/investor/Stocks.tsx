import { useEffect, useState } from "react";

/*
|--------------------------------------------------------------------------
| COMPONENTS
|--------------------------------------------------------------------------
*/

import MarketStocks from "../../components/investor/stocks/MarketStocks";
import StockDetails from "../../components/investor/stocks/StockDetails";
import BuyStock from "../../components/investor/stocks/BuyStock";
import SellStock from "../../components/investor/stocks/SellStock";
import Holdings from "../../components/investor/stocks/Holdings";
import StockChart from "../../components/investor/stocks/StockChart";

/*
|--------------------------------------------------------------------------
| STORES
|--------------------------------------------------------------------------
*/

import { useStockStore } from "../../store/stockStore";
import { useHoldingStore } from "../../store/holdingStore";
import { usePortfolioStore } from "../../store/portfolioStore";
import { useTransactionStore } from "../../store/transactionStore";

const Stocks = () => {
  /*
  |--------------------------------------------------------------------------
  | STOCK STORE
  |--------------------------------------------------------------------------
  */

  const {
    stocks,
    selectedStock,
    stockHistory,
    fetchStocks,
    fetchStockHistory,
    setSelectedStock,
  } = useStockStore();

  /*
  |--------------------------------------------------------------------------
  | HOLDINGS STORE
  |--------------------------------------------------------------------------
  */

  const { holdings, fetchHoldings } = useHoldingStore();

  /*
  |--------------------------------------------------------------------------
  | PORTFOLIO STORE
  |--------------------------------------------------------------------------
  */

  const { portfolios, fetchPortfolios } = usePortfolioStore();

  /*
  |--------------------------------------------------------------------------
  | TRANSACTION STORE
  |--------------------------------------------------------------------------
  */

  const { transactions, fetchTransactions, buyStock, sellStock } =
    useTransactionStore();

  /*
  |--------------------------------------------------------------------------
  | FORM STATE
  |--------------------------------------------------------------------------
  */

  const [quantity, setQuantity] = useState("");

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchStocks(),
          fetchHoldings(),
          fetchPortfolios(),
          fetchTransactions(),
        ]);
      } catch (error) {
        console.log(error);
      }
    };

    loadData();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | STOCK HISTORY
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (selectedStock?.stock_id) {
      fetchStockHistory(selectedStock.stock_id);
    }
  }, [selectedStock]);

  /*
  |--------------------------------------------------------------------------
  | AUTO REFRESH
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await Promise.all([
          fetchStocks(),
          fetchHoldings(),
          fetchTransactions(),
        ]);

        if (selectedStock?.stock_id) {
          await fetchStockHistory(selectedStock.stock_id);
        }
      } catch (error) {
        console.log(error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedStock]);

  /*
  |--------------------------------------------------------------------------
  | BUY STOCK
  |--------------------------------------------------------------------------
  */

  const handleBuy = async () => {
    try {
      if (!selectedStock) {
        alert("Please select a stock");
        return;
      }

      if (portfolios.length === 0) {
        alert("No portfolio found");
        return;
      }

      if (!quantity || Number(quantity) <= 0) {
        alert("Enter valid quantity");
        return;
      }

      const payload = {
        portfolio_id: portfolios[0].portfolio_id,
        isin_number: selectedStock.isin_number,
        quantity: Number(quantity),
      };

      console.log("BUY PAYLOAD:", payload);

      await buyStock(payload);

      await Promise.all([
        fetchStocks(),
        fetchHoldings(),
        fetchTransactions(),
        fetchPortfolios(),
      ]);

      await fetchStockHistory(selectedStock.stock_id);

      setQuantity("");

      alert("Stock purchased successfully");
    } catch (error: any) {
      console.log(error);

      alert(error?.response?.data?.message || "Unable to buy stock");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SELL STOCK
  |--------------------------------------------------------------------------
  */

  const handleSell = async () => {
    try {
      if (!selectedStock) {
        alert("Please select a stock");
        return;
      }

      if (portfolios.length === 0) {
        alert("No portfolio found");
        return;
      }

      if (!quantity || Number(quantity) <= 0) {
        alert("Enter valid quantity");
        return;
      }

      const payload = {
        portfolio_id: portfolios[0].portfolio_id,
        isin_number: selectedStock.isin_number,
        quantity: Number(quantity),
      };

      console.log("SELL PAYLOAD:", payload);

      await sellStock(payload);

      await Promise.all([
        fetchStocks(),
        fetchHoldings(),
        fetchTransactions(),
        fetchPortfolios(),
      ]);

      await fetchStockHistory(selectedStock.stock_id);

      setQuantity("");

      alert("Stock sold successfully");
    } catch (error: any) {
      console.log(error);

      alert(error?.response?.data?.message || "Unable to sell stock");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | PORTFOLIO VALUE
  |--------------------------------------------------------------------------
  */

  const portfolioValue = holdings.reduce(
    (total: number, holding: any) => total + Number(holding.current_value || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Stocks Trading Center
        </h1>

        <p className="text-slate-500 mt-2">
          Buy, sell and analyze your stocks.
        </p>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-2xl px-5 py-4">
          <p className="text-sm text-slate-400">Stocks</p>

          <h2 className="text-3xl font-bold">{stocks.length}</h2>
        </div>

        <div className="bg-white shadow rounded-2xl px-5 py-4">
          <p className="text-sm text-slate-400">Holdings</p>

          <h2 className="text-3xl font-bold">{holdings.length}</h2>
        </div>

        <div className="bg-white shadow rounded-2xl px-5 py-4">
          <p className="text-sm text-slate-400">Transactions</p>

          <h2 className="text-3xl font-bold">{transactions.length}</h2>
        </div>

        <div className="bg-white shadow rounded-2xl px-5 py-4">
          <p className="text-sm text-slate-400">Portfolio Value</p>

          <h2 className="text-3xl font-bold text-green-600">
            ₹{portfolioValue.toLocaleString()}
          </h2>
        </div>
      </div>

      {/* MAIN GRID */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <MarketStocks
          stocks={stocks}
          selectedStock={selectedStock}
          setSelectedStock={setSelectedStock}
        />

        <div className="xl:col-span-2 space-y-6">
          <StockDetails stock={selectedStock} />

          <StockChart history={stockHistory} stock={selectedStock} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BuyStock
              stock={selectedStock}
              quantity={quantity}
              setQuantity={setQuantity}
              handleBuy={handleBuy}
            />

            <SellStock
              stock={selectedStock}
              quantity={quantity}
              setQuantity={setQuantity}
              handleSell={handleSell}
              holding={holdings.find(
                (h: any) => h.asset_id === selectedStock?.stock_id,
              )}
            />
          </div>

          <Holdings />
        </div>
      </div>
    </div>
  );
};

export default Stocks;
