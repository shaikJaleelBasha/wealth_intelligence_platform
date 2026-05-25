import pool from "../config/db";

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
