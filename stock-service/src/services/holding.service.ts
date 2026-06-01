import pool from "../config/db";
import { PoolClient } from "pg";

export const fetchHoldings = async (userId: number) => {
  const result = await pool.query(
    `
      SELECT
        h.*,
        s.symbol,
        s.company_name

      FROM holdings h

      JOIN portfolios p
        ON p.portfolio_id =
           h.portfolio_id

      JOIN investors i
        ON i.investor_id =
           p.investor_id

      JOIN stocks s
        ON s.stock_id =
           h.asset_id

      WHERE i.user_id = $1

      ORDER BY h.holding_id DESC
    `,
    [userId],
  );

  return result.rows;
};



export const getHolding = async (
  client: PoolClient,
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

export const createHolding = async (
  client: PoolClient,
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

export const updateHolding = async (
  client: PoolClient,
  existingHolding: any,
  quantity: number,
  currentPrice: number,
  totalAmount: number,
) => {
  const updatedQuantity = Number(existingHolding.quantity) + quantity;

  const updatedInvestment =
    Number(existingHolding.total_invested) + totalAmount;

  const weightedAverage = updatedInvestment / updatedQuantity;

  const currentValue = updatedQuantity * currentPrice;

  const unrealizedProfit = currentValue - updatedInvestment;

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
      existingHolding.holding_id,
    ],
  );
};