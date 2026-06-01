import pool from "../config/db";
import { PoolClient } from "pg";

/*
|--------------------------------------------------------------------------
| RETRIEVE INVESTOR BY USER ID
|--------------------------------------------------------------------------
*/
const getInvestorByUserId = async (client: PoolClient | typeof pool, userId: number) => {
  const result = await client.query(
    `
    SELECT *
    FROM investors
    WHERE user_id = $1
    `,
    [userId]
  );
  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| RETRIEVE PORTFOLIO
|--------------------------------------------------------------------------
*/
const getPortfolio = async (
  client: PoolClient | typeof pool,
  portfolioId: number,
  investorId: number
) => {
  const result = await client.query(
    `
    SELECT *
    FROM portfolios
    WHERE portfolio_id = $1
    AND investor_id = $2
    `,
    [portfolioId, investorId]
  );
  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| RETRIEVE HOLDING
|--------------------------------------------------------------------------
*/
const getHolding = async (
  client: PoolClient | typeof pool,
  portfolioId: number,
  fundId: number
) => {
  const result = await client.query(
    `
    SELECT *
    FROM holdings
    WHERE portfolio_id = $1
    AND asset_type = 'MUTUAL_FUND'
    AND asset_id = $2
    `,
    [portfolioId, fundId]
  );
  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| CREATE HOLDING
|--------------------------------------------------------------------------
*/
const createHolding = async (
  client: PoolClient,
  portfolioId: number,
  fundId: number,
  units: number,
  nav: number,
  totalAmount: number
) => {
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
      'MUTUAL_FUND',
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
      fundId,
      units,
      nav,
      totalAmount,
      nav,
      totalAmount,
    ]
  );
};

/*
|--------------------------------------------------------------------------
| UPDATE HOLDING (ADD UNITS)
|--------------------------------------------------------------------------
*/
const updateHolding = async (
  client: PoolClient,
  holding: any,
  units: number,
  nav: number,
  totalAmount: number
) => {
  const updatedUnits = Number(holding.quantity) + units;
  const updatedInvestment = Number(holding.total_invested) + totalAmount;
  const weightedAverage = updatedInvestment / updatedUnits;
  const currentValue = updatedUnits * nav;
  const unrealizedProfit = currentValue - updatedUnits * weightedAverage;

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
      updatedUnits,
      weightedAverage,
      updatedInvestment,
      nav,
      currentValue,
      unrealizedProfit,
      holding.holding_id,
    ]
  );
};

/*
|--------------------------------------------------------------------------
| REDUCE HOLDING (SELL UNITS)
|--------------------------------------------------------------------------
*/
const reduceHolding = async (
  client: PoolClient,
  holding: any,
  sellUnits: number,
  nav: number
) => {
  const remainingUnits = Number(holding.quantity) - sellUnits;

  if (remainingUnits <= 0) {
    await client.query(
      `
      DELETE FROM holdings
      WHERE holding_id = $1
      `,
      [holding.holding_id]
    );
    return;
  }

  const avgPrice = Number(holding.average_buy_price);
  const remainingInvestment = remainingUnits * avgPrice;

  await client.query(
    `
    UPDATE holdings
    SET
      quantity = $1,
      total_invested = $2,
      current_market_price = $3,
      current_value = $1 * $3,
      unrealized_profit = ($1 * $3) - $2,
      last_updated = NOW()
    WHERE holding_id = $4
    `,
    [remainingUnits, remainingInvestment, nav, holding.holding_id]
  );
};

/*
|--------------------------------------------------------------------------
| EXPORTED SERVICES
|--------------------------------------------------------------------------
*/

export const getAllFunds = async () => {
  const result = await pool.query(`
    SELECT 
      m.*,
      COALESCE(
        (
          SELECT change_amount 
          FROM mutual_fund_price_history 
          WHERE fund_id = m.fund_id 
          ORDER BY created_at DESC 
          LIMIT 1
        ), 
        0
      ) AS change_amount,
      COALESCE(
        (
          SELECT change_percentage 
          FROM mutual_fund_price_history 
          WHERE fund_id = m.fund_id 
          ORDER BY created_at DESC 
          LIMIT 1
        ), 
        0
      ) AS change_percentage
    FROM mutual_funds m
    ORDER BY fund_id DESC
  `);
  return result.rows;
};

export const getNavHistory = async (fundId: number) => {
  const result = await pool.query(
    `
    SELECT 
      ROUND(nav::numeric, 4) AS nav,
      ROUND(change_amount::numeric, 4) AS change_amount,
      ROUND(change_percentage::numeric, 2) AS change_percentage,
      TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') AS date
    FROM mutual_fund_price_history
    WHERE fund_id = $1
    ORDER BY created_at DESC
    LIMIT 100
    `,
    [fundId]
  );
  return result.rows.reverse(); // Return in chronological order
};

export const createFund = async (data: any) => {
  const result = await pool.query(
    `
    INSERT INTO mutual_funds (name, symbol, category, risk_level, nav, expense_ratio, min_investment)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
    `,
    [data.name, data.symbol, data.category, data.risk_level, data.nav, data.expense_ratio, data.min_investment]
  );

  const fund = result.rows[0];

  // Insert initial price history
  await pool.query(
    `
    INSERT INTO mutual_fund_price_history (fund_id, nav, change_amount, change_percentage)
    VALUES ($1, $2, 0, 0)
    `,
    [fund.fund_id, fund.nav]
  );

  return fund;
};

export const updateFundNav = async (fundId: number, newNav: number) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const fundResult = await client.query("SELECT nav FROM mutual_funds WHERE fund_id = $1", [fundId]);
    if (fundResult.rowCount === 0) {
      throw new Error("Mutual fund not found");
    }

    const oldNav = Number(fundResult.rows[0].nav);
    const changeAmount = newNav - oldNav;
    const changePercentage = ((changeAmount / oldNav) * 100).toFixed(2);

    // Update main table
    const result = await client.query(
      `
      UPDATE mutual_funds
      SET nav = $1, updated_at = NOW()
      WHERE fund_id = $2
      RETURNING *
      `,
      [newNav, fundId]
    );

    // Insert history
    await client.query(
      `
      INSERT INTO mutual_fund_price_history (fund_id, nav, change_amount, change_percentage)
      VALUES ($1, $2, $3, $4)
      `,
      [fundId, newNav, changeAmount, changePercentage]
    );

    // Update holdings current value for mutual funds
    await client.query(
      `
      UPDATE holdings
      SET 
        current_market_price = $1,
        current_value = quantity * $1,
        unrealized_profit = (quantity * $1) - total_invested,
        last_updated = NOW()
      WHERE asset_type = 'MUTUAL_FUND' AND asset_id = $2
      `,
      [newNav, fundId]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const deleteFund = async (fundId: number) => {
  await pool.query("DELETE FROM mutual_funds WHERE fund_id = $1", [fundId]);
};

export const buyFund = async (user: any, data: any) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const investor = await getInvestorByUserId(client, user.user_id);
    if (!investor) {
      throw new Error("Investor not found");
    }

    const portfolio = await getPortfolio(client, data.portfolio_id, investor.investor_id);
    if (!portfolio) {
      throw new Error("Portfolio not found");
    }

    const fundResult = await client.query("SELECT * FROM mutual_funds WHERE fund_id = $1", [data.fund_id]);
    const fund = fundResult.rows[0];
    if (!fund) {
      throw new Error("Mutual fund not found");
    }

    const amount = Number(data.amount);
    if (amount < Number(fund.min_investment)) {
      throw new Error(`Minimum investment for this fund is ₹${fund.min_investment}`);
    }

    const nav = Number(fund.nav);
    const units = amount / nav;

    // 1. Log transaction
    const transactionResult = await client.query(
      `
      INSERT INTO mutual_fund_transactions (portfolio_id, fund_id, transaction_type, amount, nav_at_transaction, units, status)
      VALUES ($1, $2, 'BUY', $3, $4, $5, 'COMPLETED')
      RETURNING *
      `,
      [portfolio.portfolio_id, fund.fund_id, amount, nav, units]
    );

    // 2. Manage generic holdings
    const holding = await getHolding(client, portfolio.portfolio_id, fund.fund_id);
    if (!holding) {
      await createHolding(client, portfolio.portfolio_id, fund.fund_id, units, nav, amount);
    } else {
      await updateHolding(client, holding, units, nav, amount);
    }

    // 3. Update portfolio investment and current value
    const updatedInvestment = Number(portfolio.total_investment || 0) + amount;
    const updatedValue = Number(portfolio.current_value || 0) + amount;

    await client.query(
      `
      UPDATE portfolios
      SET total_investment = $1, current_value = $2, updated_at = NOW()
      WHERE portfolio_id = $3
      `,
      [updatedInvestment, updatedValue, portfolio.portfolio_id]
    );

    await client.query("COMMIT");

    return {
      success: true,
      message: "Mutual fund units purchased successfully",
      transaction: transactionResult.rows[0],
    };
  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const sellFund = async (user: any, data: any) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const investor = await getInvestorByUserId(client, user.user_id);
    if (!investor) {
      throw new Error("Investor not found");
    }

    const portfolio = await getPortfolio(client, data.portfolio_id, investor.investor_id);
    if (!portfolio) {
      throw new Error("Portfolio not found");
    }

    const fundResult = await client.query("SELECT * FROM mutual_funds WHERE fund_id = $1", [data.fund_id]);
    const fund = fundResult.rows[0];
    if (!fund) {
      throw new Error("Mutual fund not found");
    }

    const holding = await getHolding(client, portfolio.portfolio_id, fund.fund_id);
    if (!holding) {
      throw new Error("You do not hold any units of this mutual fund");
    }

    const sellUnits = Number(data.units);
    if (sellUnits <= 0 || sellUnits > Number(holding.quantity)) {
      throw new Error(`Insufficient units. You hold only ${holding.quantity} units`);
    }

    const nav = Number(fund.nav);
    const redeemAmount = sellUnits * nav;
    const realizedProfit = (nav - Number(holding.average_buy_price)) * sellUnits;

    // 1. Log transaction
    const transactionResult = await client.query(
      `
      INSERT INTO mutual_fund_transactions (portfolio_id, fund_id, transaction_type, amount, nav_at_transaction, units, status)
      VALUES ($1, $2, 'SELL', $3, $4, $5, 'COMPLETED')
      RETURNING *
      `,
      [portfolio.portfolio_id, fund.fund_id, redeemAmount, nav, sellUnits]
    );

    // 2. Reduce holdings
    await reduceHolding(client, holding, sellUnits, nav);

    // 3. Update portfolio
    await client.query(
      `
      UPDATE portfolios
      SET 
        current_value = current_value - $1,
        updated_at = NOW()
      WHERE portfolio_id = $2
      `,
      [redeemAmount, portfolio.portfolio_id]
    );

    await client.query("COMMIT");

    return {
      success: true,
      message: "Mutual fund units redeemed successfully",
      realizedProfit,
      transaction: transactionResult.rows[0],
    };
  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const fetchTransactionHistory = async (user: any) => {
  const result = await pool.query(
    `
    SELECT 
      mft.*,
      mf.name AS fund_name,
      mf.symbol AS fund_symbol
    FROM mutual_fund_transactions mft
    JOIN portfolios p ON p.portfolio_id = mft.portfolio_id
    JOIN investors i ON i.investor_id = p.investor_id
    JOIN mutual_funds mf ON mf.fund_id = mft.fund_id
    WHERE i.user_id = $1
    ORDER BY mft.transaction_date DESC
    `,
    [user.user_id]
  );
  return result.rows;
};
