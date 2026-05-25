import { useEffect, useState } from "react";

/* =========================================================
   COMPONENTS
========================================================= */

import MarketStocks from "../../components/investor/stocks/MarketStocks";

import StockDetails from "../../components/investor/stocks/StockDetails";

import BuyStock from "../../components/investor/stocks/BuyStock";

import SellStock from "../../components/investor/stocks/SellStock";

import Holdings from "../../components/investor/stocks/Holdings";

/* =========================================================
   STORES
========================================================= */

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

    setSelectedStock,

    fetchStocks,
  } = useStockStore();

  /*
  |--------------------------------------------------------------------------
  | HOLDING STORE
  |--------------------------------------------------------------------------
  */

  const {
    holdings,

    fetchHoldings,
  } = useHoldingStore();

  /*
  |--------------------------------------------------------------------------
  | PORTFOLIO STORE
  |--------------------------------------------------------------------------
  */

  const {
    portfolios,

    fetchPortfolios,
  } = usePortfolioStore();


   console.log("Buying stock with data:", {
     portfolio_id: portfolios[0]?.portfolio_id,
   });
  /*
  |--------------------------------------------------------------------------
  | TRANSACTION STORE
  |--------------------------------------------------------------------------
  */

  const {
    transactions,

    fetchTransactions,

    buyStock,

    sellStock,
  } = useTransactionStore();

  /*
  |--------------------------------------------------------------------------
  | STATES
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
  | BUY STOCK
  |--------------------------------------------------------------------------
  */

  const handleBuy = async () => {
    try {
      /*
      |--------------------------------------------------------------------------
      | VALIDATION
      |--------------------------------------------------------------------------
      */

      if (!selectedStock) {
        return alert("Please select a stock");
      }

      if (!quantity) {
        return alert("Please enter quantity");
      }

      if (portfolios.length === 0) {
        return alert("No portfolio found");
      }

      /*
      |--------------------------------------------------------------------------
      | BUY API
      |--------------------------------------------------------------------------
      */
   
     

      await buyStock({
        portfolio_id: portfolios[0]?.portfolio_id,

        isin_number: selectedStock.isin_number,

        quantity: Number(quantity),
      });

      /*
      |--------------------------------------------------------------------------
      | REFRESH EVERYTHING
      |--------------------------------------------------------------------------
      */

      await Promise.all([
        fetchStocks(),

        fetchHoldings(),

        fetchPortfolios(),

        fetchTransactions(),
      ]);

      /*
      |--------------------------------------------------------------------------
      | RESET
      |--------------------------------------------------------------------------
      */

      setQuantity("");

      /*
      |--------------------------------------------------------------------------
      | SUCCESS
      |--------------------------------------------------------------------------
      */

      alert("Stock Purchased Successfully");
    } catch (error: any) {
      console.log(error);

      alert(error.response?.data?.message || "Purchase Failed");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SELL STOCK
  |--------------------------------------------------------------------------
  */

  const handleSell = async () => {
    try {
      /*
      |--------------------------------------------------------------------------
      | VALIDATION
      |--------------------------------------------------------------------------
      */

      if (!selectedStock) {
        return alert("Please select a stock");
      }

      if (!quantity) {
        return alert("Please enter quantity");
      }

      if (portfolios.length === 0) {
        return alert("No portfolio found");
      }

      /*
      |--------------------------------------------------------------------------
      | SELL API
      |--------------------------------------------------------------------------
      */

      await sellStock({
        portfolio_id: portfolios[0]?.portfolio_id,

        isin_number: selectedStock.isin_number,

        quantity: Number(quantity),
      });

      /*
      |--------------------------------------------------------------------------
      | REFRESH EVERYTHING
      |--------------------------------------------------------------------------
      */

      await Promise.all([
        fetchStocks(),

        fetchHoldings(),

        fetchPortfolios(),

        fetchTransactions(),
      ]);

      /*
      |--------------------------------------------------------------------------
      | RESET
      |--------------------------------------------------------------------------
      */

      setQuantity("");

      /*
      |--------------------------------------------------------------------------
      | SUCCESS
      |--------------------------------------------------------------------------
      */

      alert("Stock Sold Successfully");
    } catch (error: any) {
      console.log(error);

      alert(error.response?.data?.message || "Sell Failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Stocks Trading Center
          </h1>

          <p className="text-slate-500 mt-2">
            Buy, sell and analyze your stocks portfolio.
          </p>
        </div>

        {/* QUICK STATS */}

        <div className="flex gap-4">
          <div className="bg-white shadow rounded-2xl px-5 py-3">
            <p className="text-sm text-slate-400">Stocks</p>

            <h2 className="text-2xl font-bold">{stocks.length}</h2>
          </div>

          <div className="bg-white shadow rounded-2xl px-5 py-3">
            <p className="text-sm text-slate-400">Holdings</p>

            <h2 className="text-2xl font-bold">{holdings.length}</h2>
          </div>

          <div className="bg-white shadow rounded-2xl px-5 py-3">
            <p className="text-sm text-slate-400">Transactions</p>

            <h2 className="text-2xl font-bold">{transactions.length}</h2>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* =====================================================
            LEFT SIDE
        ===================================================== */}

        <MarketStocks
          stocks={stocks}
          selectedStock={selectedStock}
          setSelectedStock={setSelectedStock}
        />

        {/* =====================================================
            RIGHT SIDE
        ===================================================== */}

        <div className="xl:col-span-2 space-y-6">
          {/* =====================================================
              STOCK DETAILS
          ===================================================== */}

          {selectedStock && <StockDetails stock={selectedStock} />}

          {/* =====================================================
              BUY + SELL
          ===================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BUY */}

            <BuyStock
              stock={selectedStock}
              quantity={quantity}
              setQuantity={setQuantity}
              handleBuy={handleBuy}
            />

            {/* SELL */}

            <SellStock
              stock={selectedStock}
              quantity={quantity}
              setQuantity={setQuantity}
              handleSell={handleSell}
            />
          </div>

          {/* =====================================================
              HOLDINGS
          ===================================================== */}

          <Holdings />
        </div>
      </div>
    </div>
  );
};

export default Stocks;
