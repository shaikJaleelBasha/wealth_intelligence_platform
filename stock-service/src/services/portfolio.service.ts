import pool from "../config/db";

/*
|--------------------------------------------------------------------------
| FETCH PORTFOLIOS
|--------------------------------------------------------------------------
*/

export const fetchMyPortfolios = async (userId: number) => {
  /*
    |--------------------------------------------------------------------------
    | INVESTOR
    |--------------------------------------------------------------------------
    */

  const investorResult = await pool.query(
    `
        SELECT *
        FROM investors
        WHERE user_id = $1
      `,
    [userId],
  );

  const investor = investorResult.rows[0];

  if (!investor) {
    throw new Error("Investor not found");
  }

  /*
    |--------------------------------------------------------------------------
    | PORTFOLIOS
    |--------------------------------------------------------------------------
    */

  const portfolioResult = await pool.query(
    `
        SELECT *
        FROM portfolios
        WHERE investor_id = $1
      `,
    [investor.investor_id],
  );

  return portfolioResult.rows;
};

import { PoolClient } from "pg";

export const getPortfolio = async (
  client: PoolClient,
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

export const updatePortfolio = async (
  client: PoolClient,
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