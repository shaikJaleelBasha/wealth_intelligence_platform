import pool from "../config/db";
import { buyFund } from "./mutualfund.service";

export const createSip = async (user: any, data: any) => {
  const amount = Number(data.amount);
  if (amount <= 0) {
    throw new Error("Invalid investment amount");
  }

  // Verify fund exists
  const fundResult = await pool.query("SELECT * FROM mutual_funds WHERE fund_id = $1", [data.fund_id]);
  const fund = fundResult.rows[0];
  if (!fund) {
    throw new Error("Mutual fund not found");
  }

  if (amount < Number(fund.min_investment)) {
    throw new Error(`Minimum investment for this fund is ₹${fund.min_investment}`);
  }

  // Verify investor portfolio
  const investorResult = await pool.query("SELECT investor_id FROM investors WHERE user_id = $1", [user.user_id]);
  if (investorResult.rowCount === 0) {
    throw new Error("Investor not found");
  }
  const investorId = investorResult.rows[0].investor_id;

  const portfolioResult = await pool.query(
    "SELECT portfolio_id FROM portfolios WHERE portfolio_id = $1 AND investor_id = $2",
    [data.portfolio_id, investorId]
  );
  if (portfolioResult.rowCount === 0) {
    throw new Error("Portfolio not found");
  }

  // Calculate next installment date (1 month from now)
  const nextInstallment = new Date();
  nextInstallment.setMonth(nextInstallment.getMonth() + 1);

  const result = await pool.query(
    `
    INSERT INTO sips (portfolio_id, fund_id, amount, frequency, next_installment_date, status)
    VALUES ($1, $2, $3, 'MONTHLY', $4, 'ACTIVE')
    RETURNING *
    `,
    [data.portfolio_id, data.fund_id, amount, nextInstallment]
  );

  return result.rows[0];
};

export const fetchMySips = async (user: any) => {
  const result = await pool.query(
    `
    SELECT 
      s.*,
      mf.name AS fund_name,
      mf.symbol AS fund_symbol,
      mf.nav AS current_nav
    FROM sips s
    JOIN portfolios p ON p.portfolio_id = s.portfolio_id
    JOIN investors i ON i.investor_id = p.investor_id
    JOIN mutual_funds mf ON mf.fund_id = s.fund_id
    WHERE i.user_id = $1
    ORDER BY s.next_installment_date ASC
    `,
    [user.user_id]
  );
  return result.rows;
};

export const updateSipStatus = async (user: any, sipId: number, status: string) => {
  if (!["ACTIVE", "PAUSED", "CANCELLED"].includes(status)) {
    throw new Error("Invalid status type");
  }

  // Verify ownership
  const ownership = await pool.query(
    `
    SELECT s.sip_id 
    FROM sips s
    JOIN portfolios p ON p.portfolio_id = s.portfolio_id
    JOIN investors i ON i.investor_id = p.investor_id
    WHERE s.sip_id = $1 AND i.user_id = $2
    `,
    [sipId, user.user_id]
  );

  if (ownership.rowCount === 0) {
    throw new Error("SIP not found or unauthorized");
  }

  const result = await pool.query(
    `
    UPDATE sips
    SET status = $1, updated_at = NOW()
    WHERE sip_id = $2
    RETURNING *
    `,
    [status, sipId]
  );

  return result.rows[0];
};

export const processDueSips = async () => {
  console.log("Running Daily SIP installment execution service...");

  const dueSipsResult = await pool.query(`
    SELECT 
      s.*,
      i.user_id,
      mf.nav
    FROM sips s
    JOIN portfolios p ON p.portfolio_id = s.portfolio_id
    JOIN investors i ON i.investor_id = p.investor_id
    JOIN mutual_funds mf ON mf.fund_id = s.fund_id
    WHERE s.status = 'ACTIVE' AND s.next_installment_date <= CURRENT_DATE
  `);

  const dueSips = dueSipsResult.rows;
  console.log(`Found ${dueSips.length} due SIP installments.`);

  for (const sip of dueSips) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      console.log(`Processing SIP ${sip.sip_id} for User ${sip.user_id}, Amount: ₹${sip.amount}`);

      const amount = Number(sip.amount);
      const nav = Number(sip.nav);
      const units = amount / nav;

      // 1. Create Mutual Fund transaction
      await client.query(
        `
        INSERT INTO mutual_fund_transactions (portfolio_id, fund_id, transaction_type, amount, nav_at_transaction, units, status)
        VALUES ($1, $2, 'SIP_INSTALLMENT', $3, $4, $5, 'COMPLETED')
        `,
        [sip.portfolio_id, sip.fund_id, amount, nav, units]
      );

      // 2. Manage generic holdings for mutual funds
      const holdingResult = await client.query(
        `
        SELECT * FROM holdings 
        WHERE portfolio_id = $1 AND asset_type = 'MUTUAL_FUND' AND asset_id = $2
        `,
        [sip.portfolio_id, sip.fund_id]
      );

      const holding = holdingResult.rows[0];
      if (!holding) {
        // Create new holding
        await client.query(
          `
          INSERT INTO holdings
          (portfolio_id, asset_type, asset_id, quantity, average_buy_price, total_invested, current_market_price, current_value, unrealized_profit, realized_profit, last_updated)
          VALUES ($1, 'MUTUAL_FUND', $2, $3, $4, $5, $4, $5, 0, 0, NOW())
          `,
          [sip.portfolio_id, sip.fund_id, units, nav, amount]
        );
      } else {
        // Update existing holding
        const updatedUnits = Number(holding.quantity) + units;
        const updatedInvestment = Number(holding.total_invested) + amount;
        const weightedAverage = updatedInvestment / updatedUnits;
        const currentValue = updatedUnits * nav;
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
          [updatedUnits, weightedAverage, updatedInvestment, nav, currentValue, unrealizedProfit, holding.holding_id]
        );
      }

      // 3. Update Portfolio investment values
      await client.query(
        `
        UPDATE portfolios
        SET 
          total_investment = total_investment + $1,
          current_value = current_value + $1,
          updated_at = NOW()
        WHERE portfolio_id = $2
        `,
        [amount, sip.portfolio_id]
      );

      // 4. Advance next installment date (1 month)
      const nextDate = new Date(sip.next_installment_date);
      nextDate.setMonth(nextDate.getMonth() + 1);

      await client.query(
        `
        UPDATE sips
        SET next_installment_date = $1, updated_at = NOW()
        WHERE sip_id = $2
        `,
        [nextDate, sip.sip_id]
      );

      await client.query("COMMIT");
      console.log(`✔ SIP ${sip.sip_id} successfully executed!`);
    } catch (err: any) {
      await client.query("ROLLBACK");
      console.error(`❌ Failed to execute SIP ${sip.sip_id}:`, err.message);
    } finally {
      client.release();
    }
  }
};
