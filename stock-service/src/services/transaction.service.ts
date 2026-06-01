import pool from "../config/db";

import { increaseMarketStock } from "../repositories/stock.repository";

import {reduceHolding} from "../repositories/holding.repository";

/*
|--------------------------------------------------------------------------
| GET INVESTOR
|--------------------------------------------------------------------------
*/



const getInvestorByUserId = async (client: any, userId: number) => {
  const result = await client.query(
    `
    SELECT *
    FROM investors
    WHERE user_id = $1
  `,
    [userId],
  );

  return result.rows[0];
};

const now = new Date();

const hour = now.getHours();

/*
|--------------------------------------------------------------------------
| GET PORTFOLIO
|--------------------------------------------------------------------------
*/

const getPortfolio = async (
  client: any,
  portfolioId: number,
  investorId: number,
) => {
  const result = await client.query(
    `
    SELECT *
    FROM portfolios
    WHERE portfolio_id = $1
    AND investor_id = $2
  `,
    [portfolioId, investorId],
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| GET STOCK
|--------------------------------------------------------------------------
*/

const getStockByIsin = async (client: any, isinNumber: string) => {
  const result = await client.query(
    `
    SELECT *
    FROM stocks
    WHERE isin_number = $1
  `,
    [isinNumber],
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| REDUCE MARKET STOCK
|--------------------------------------------------------------------------
*/

const reduceMarketStock = async (
  client: any,
  stockId: number,
  quantity: number,
) => {
  await client.query(
    `
    UPDATE stocks
    SET
      available_quantity =
        available_quantity - $1,

      updated_at = NOW()

    WHERE stock_id = $2
  `,
    [quantity, stockId],
  );
};

/*
|--------------------------------------------------------------------------
| GET HOLDING
|--------------------------------------------------------------------------
*/

const getHolding = async (
  client: any,
  portfolioId: number,
  stockId: number,
) => {
  const result = await client.query(
    `
    SELECT *
    FROM holdings
    WHERE portfolio_id = $1
    AND asset_type = 'STOCK'
    AND asset_id = $2
  `,
    [portfolioId, stockId],
  );

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| CREATE HOLDING
|--------------------------------------------------------------------------
*/

const createHolding = async (
  client: any,
  portfolioId: number,
  stockId: number,
  quantity: number,
  currentPrice: number,
  totalAmount: number,
) => {
  const currentValue = quantity * currentPrice;

  await client.query(
    `
    INSERT INTO holdings
    (
      portfolio_id,
      asset_type,
      asset_id,
      quantity,
      average_buy_price,
      total_invested,
      current_market_price,
      current_value,
      unrealized_profit,
      realized_profit,
      last_updated
    )
    VALUES
    (
      $1,
      'STOCK',
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      0,
      0,
      NOW()
    )
  `,
    [
      portfolioId,
      stockId,
      quantity,
      currentPrice,
      totalAmount,
      currentPrice,
      currentValue,
    ],
  );
};

/*
|--------------------------------------------------------------------------
| UPDATE HOLDING
|--------------------------------------------------------------------------
*/

const updateHolding = async (
  client: any,
  holding: any,
  quantity: number,
  currentPrice: number,
  totalAmount: number,
) => {
  const updatedQuantity = Number(holding.quantity) + quantity;

  const updatedInvestment = Number(holding.total_invested) + totalAmount;

  const weightedAverage = updatedInvestment / updatedQuantity;

  const currentValue = updatedQuantity * currentPrice;

  const unrealizedProfit = currentValue - updatedQuantity * weightedAverage;
  await client.query(
    `
    UPDATE holdings
    SET
      quantity = $1,

      average_buy_price = $2,

      total_invested = $3,

      current_market_price = $4,

      current_value = $5,

      unrealized_profit = $6,

      last_updated = NOW()

    WHERE holding_id = $7
  `,
    [
      updatedQuantity,
      weightedAverage,
      updatedInvestment,
      currentPrice,
      currentValue,
      unrealizedProfit,
      holding.holding_id,
    ],
  );
};

/*
|--------------------------------------------------------------------------
| UPDATE PORTFOLIO
|--------------------------------------------------------------------------
*/

const updatePortfolio = async (
  client: any,
  portfolio: any,
  totalAmount: number,
) => {
  const updatedInvestment =
    Number(portfolio.total_investment || 0) + totalAmount;

  const updatedValue = Number(portfolio.current_value || 0) + totalAmount;

  await client.query(
    `
    UPDATE portfolios
    SET
      total_investment = $1,

      current_value = $2,

      updated_at = NOW()

    WHERE portfolio_id = $3
  `,
    [updatedInvestment, updatedValue, portfolio.portfolio_id],
  );
};

/*
|--------------------------------------------------------------------------
| BUY STOCK
|--------------------------------------------------------------------------
*/

export const buyStock = async (user: any, data: any) => {
  const now = new Date();

  const hour = now.getHours();

  if (hour < 9 || hour >= 15) {
    throw new Error(
      "Market is closed. Trading allowed between 9AM and 3PM only.",
    );
  }
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const investor = await getInvestorByUserId(client, user.user_id);

    if (!investor) {
      throw new Error("Investor not found");
    }

    const portfolio = await getPortfolio(
      client,
      data.portfolio_id,
      investor.investor_id,
    );

    if (!portfolio) {
      throw new Error("Portfolio not found");
    }

    const stock = await getStockByIsin(client, data.isin_number);

    if (!stock) {
      throw new Error("Stock not found");
    }

    const quantity = Number(data.quantity);

    if (quantity <= 0) {
      throw new Error("Invalid quantity");
    }

    if (quantity > Number(stock.available_quantity)) {
      throw new Error("Insufficient stock quantity");
    }

    const currentPrice = Number(stock.current_price);

    const totalAmount = quantity * currentPrice;

    /*
    |--------------------------------------------------------------------------
    | INSERT TRANSACTION
    |--------------------------------------------------------------------------
    */

    const transactionResult = await client.query(
      `
        INSERT INTO stock_transactions
        (
          portfolio_id,
          stock_id,
          transaction_type,
          order_type,
          quantity,
          price_per_share,
          brokerage_fee,
          tax_amount,
          total_amount,
          order_status,
          transaction_date,
          created_at
        )
        VALUES
        (
          $1,
          $2,
          'BUY',
          'MARKET',
          $3,
          $4,
          0,
          0,
          $5,
          'COMPLETED',
          NOW(),
          NOW()
        )
        RETURNING *
      `,
      [
        portfolio.portfolio_id,
        stock.stock_id,
        quantity,
        currentPrice,
        totalAmount,
      ],
    );

    /*
    |--------------------------------------------------------------------------
    | REDUCE STOCK QUANTITY
    |--------------------------------------------------------------------------
    */

    await reduceMarketStock(client, stock.stock_id, quantity);

    /*
    |--------------------------------------------------------------------------
    | HOLDINGS
    |--------------------------------------------------------------------------
    */

    const holding = await getHolding(
      client,
      portfolio.portfolio_id,
      stock.stock_id,
    );

    if (!holding) {
      await createHolding(
        client,
        portfolio.portfolio_id,
        stock.stock_id,
        quantity,
        currentPrice,
        totalAmount,
      );
    } else {
      await updateHolding(client, holding, quantity, currentPrice, totalAmount);
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE PORTFOLIO
    |--------------------------------------------------------------------------
    */

    await updatePortfolio(client, portfolio, totalAmount);

    await client.query("COMMIT");

    return {
      success: true,

      message: "Stock purchased successfully",

      transaction: transactionResult.rows[0],
    };
  } catch (error: any) {
    await client.query("ROLLBACK");

    console.log("BUY STOCK ERROR:", error.message);

    throw error;
  } finally {
    client.release();
  }
};

/*
|--------------------------------------------------------------------------
| SELL STOCK
|--------------------------------------------------------------------------
*/

export const sellStock = async (user: any, data: any) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /*
    |--------------------------------------------------------------------------
    | INVESTOR
    |--------------------------------------------------------------------------
    */

    const investorResult = await client.query(
      `
      SELECT *
      FROM investors
      WHERE user_id = $1
      `,
      [user.user_id],
    );

    const investor = investorResult.rows[0];

    if (!investor) {
      throw new Error("Investor not found");
    }

    /*
    |--------------------------------------------------------------------------
    | PORTFOLIO
    |--------------------------------------------------------------------------
    */

    const portfolioResult = await client.query(
      `
        SELECT *
        FROM portfolios
        WHERE portfolio_id = $1
        AND investor_id = $2
        `,
      [data.portfolio_id, investor.investor_id],
    );

    const portfolio = portfolioResult.rows[0];

    if (!portfolio) {
      throw new Error("Portfolio not found");
    }

    /*
    |--------------------------------------------------------------------------
    | STOCK
    |--------------------------------------------------------------------------
    */

    const stockResult = await client.query(
      `
        SELECT *
        FROM stocks
        WHERE isin_number = $1
        `,
      [data.isin_number],
    );

    const stock = stockResult.rows[0];

    if (!stock) {
      throw new Error("Stock not found");
    }

    /*
    |--------------------------------------------------------------------------
    | HOLDING
    |--------------------------------------------------------------------------
    */

    const holdingResult = await client.query(
      `
        SELECT *
        FROM holdings
        WHERE portfolio_id = $1
        AND asset_type = 'STOCK'
        AND asset_id = $2
        `,
      [portfolio.portfolio_id, stock.stock_id],
    );

    const holding = holdingResult.rows[0];

    if (!holding) {
      throw new Error("Holding not found");
    }

    const sellQuantity = Number(data.quantity);

    if (sellQuantity > Number(holding.quantity)) {
      throw new Error("Not enough shares");
    }

    const currentPrice = Number(stock.current_price);

    const totalAmount = currentPrice * sellQuantity;

    /*
    |--------------------------------------------------------------------------
    | REALIZED PROFIT
    |--------------------------------------------------------------------------
    */

    const realizedProfit =
      (currentPrice - Number(holding.average_buy_price)) * sellQuantity;

    /*
    |--------------------------------------------------------------------------
    | TRANSACTION
    |--------------------------------------------------------------------------
    */

    const transactionResult = await client.query(
      `
        INSERT INTO stock_transactions
        (
          portfolio_id,
          stock_id,
          transaction_type,
          order_type,
          quantity,
          price_per_share,
          total_amount,
          order_status,
          transaction_date,
          created_at
        )
        VALUES
        (
          $1,
          $2,
          'SELL',
          'MARKET',
          $3,
          $4,
          $5,
          'COMPLETED',
          NOW(),
          NOW()
        )
        RETURNING *
        `,
      [
        portfolio.portfolio_id,
        stock.stock_id,
        sellQuantity,
        currentPrice,
        totalAmount,
      ],
    );

    /*
    |--------------------------------------------------------------------------
    | RETURN SHARES TO MARKET
    |--------------------------------------------------------------------------
    */

    await increaseMarketStock(client, stock.stock_id, sellQuantity);

    /*
    |--------------------------------------------------------------------------
    | UPDATE HOLDING
    |--------------------------------------------------------------------------
    */

    await reduceHolding(client, holding, sellQuantity);

    /*
    |--------------------------------------------------------------------------
    | UPDATE PORTFOLIO
    |--------------------------------------------------------------------------
    */

    await client.query(
      `
      UPDATE portfolios
      SET
        current_value =
          current_value - $1,

        updated_at = NOW()

      WHERE portfolio_id = $2
      `,
      [totalAmount, portfolio.portfolio_id],
    );

    await client.query("COMMIT");

    return {
      success: true,

      realizedProfit,

      transaction: transactionResult.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");

    throw error;
  } finally {
    client.release();
  }
};

/*
|--------------------------------------------------------------------------
| ORDER HISTORY
|--------------------------------------------------------------------------
*/

export const orderHistory = async (user: any) => {
  const result = await pool.query(
    `
    SELECT
      st.*,
      s.symbol,
      s.company_name

    FROM stock_transactions st

    JOIN portfolios p
      ON p.portfolio_id =
         st.portfolio_id

    JOIN investors i
      ON i.investor_id =
         p.investor_id

    JOIN stocks s
      ON s.stock_id =
         st.stock_id

    WHERE i.user_id = $1

    ORDER BY st.created_at DESC
  `,
    [user.user_id],
  );

  return result.rows;
};

