import pool from "./db";

export const initSchema = async () => {
  try {
    console.log("Checking and initializing database tables...");

    // 1. Create mutual_funds table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mutual_funds (
        fund_id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        symbol VARCHAR(50) UNIQUE NOT NULL,
        category VARCHAR(100) NOT NULL,
        risk_level VARCHAR(50) NOT NULL,
        nav NUMERIC(15, 4) NOT NULL,
        expense_ratio NUMERIC(5, 2) NOT NULL,
        min_investment NUMERIC(15, 2) NOT NULL,
        available_units NUMERIC(15, 4) DEFAULT 10000000.0000,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✔ mutual_funds table checked");

    // 2. Create mutual_fund_price_history table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mutual_fund_price_history (
        history_id SERIAL PRIMARY KEY,
        fund_id INTEGER REFERENCES mutual_funds(fund_id) ON DELETE CASCADE,
        nav NUMERIC(15, 4) NOT NULL,
        change_amount NUMERIC(15, 4) DEFAULT 0,
        change_percentage NUMERIC(5, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✔ mutual_fund_price_history table checked");

    // 3. Create sips table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sips (
        sip_id SERIAL PRIMARY KEY,
        portfolio_id INTEGER REFERENCES portfolios(portfolio_id) ON DELETE CASCADE,
        fund_id INTEGER REFERENCES mutual_funds(fund_id) ON DELETE CASCADE,
        amount NUMERIC(15, 2) NOT NULL,
        frequency VARCHAR(50) DEFAULT 'MONTHLY',
        next_installment_date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✔ sips table checked");

    // 4. Create mutual_fund_transactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mutual_fund_transactions (
        transaction_id SERIAL PRIMARY KEY,
        portfolio_id INTEGER REFERENCES portfolios(portfolio_id) ON DELETE CASCADE,
        fund_id INTEGER REFERENCES mutual_funds(fund_id) ON DELETE CASCADE,
        transaction_type VARCHAR(50) NOT NULL, -- BUY, SELL, SIP_INSTALLMENT
        amount NUMERIC(15, 2) NOT NULL,
        nav_at_transaction NUMERIC(15, 4) NOT NULL,
        units NUMERIC(15, 4) NOT NULL,
        status VARCHAR(50) DEFAULT 'COMPLETED',
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✔ mutual_fund_transactions table checked");

    // 5. Create api_logs table for requests auditing
    await pool.query(`
      CREATE TABLE IF NOT EXISTS api_logs (
        log_id SERIAL PRIMARY KEY,
        method VARCHAR(10) NOT NULL,
        path VARCHAR(255) NOT NULL,
        status INTEGER NOT NULL,
        duration_ms NUMERIC(10, 2) NOT NULL,
        ip_address VARCHAR(45),
        user_email VARCHAR(255),
        role_name VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✔ api_logs table checked");

    // Seed initial data if mutual_funds table is empty
    const checkFunds = await pool.query("SELECT COUNT(*) FROM mutual_funds");
    if (parseInt(checkFunds.rows[0].count) === 0) {
      console.log("Seeding initial mutual funds...");

      const fundsToSeed = [
        {
          name: "SBI Bluechip Fund",
          symbol: "SBIBLUE",
          category: "Equity - Large Cap",
          risk_level: "High",
          nav: 85.50,
          expense_ratio: 1.21,
          min_investment: 500,
        },
        {
          name: "HDFC Index Fund Nifty 50 Plan",
          symbol: "HDFCIND",
          category: "Equity - Index",
          risk_level: "Moderate",
          nav: 120.25,
          expense_ratio: 0.40,
          min_investment: 1000,
        },
        {
          name: "Parag Parikh Flexi Cap Fund",
          symbol: "PPFLEXI",
          category: "Equity - Flexi Cap",
          risk_level: "High",
          nav: 65.10,
          expense_ratio: 1.35,
          min_investment: 500,
        },
        {
          name: "ICICI Prudential Liquid Fund",
          symbol: "ICICILIQ",
          category: "Debt - Liquid",
          risk_level: "Low",
          nav: 310.80,
          expense_ratio: 0.25,
          min_investment: 5000,
        },
        {
          name: "Axis Small Cap Fund",
          symbol: "AXISML",
          category: "Equity - Small Cap",
          risk_level: "Very High",
          nav: 45.30,
          expense_ratio: 1.62,
          min_investment: 500,
        },
      ];

      for (const fund of fundsToSeed) {
        const result = await pool.query(
          `
          INSERT INTO mutual_funds (name, symbol, category, risk_level, nav, expense_ratio, min_investment)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING fund_id
          `,
          [
            fund.name,
            fund.symbol,
            fund.category,
            fund.risk_level,
            fund.nav,
            fund.expense_ratio,
            fund.min_investment,
          ]
        );

        const fundId = result.rows[0].fund_id;

        // Seed 10 mock price history points for charts!
        const baseNav = fund.nav;
        for (let i = 9; i >= 0; i--) {
          // Create a trend: slightly lower prices in the past
          const randPercentage = (Math.random() * 2 - 1) / 100; // -1% to +1%
          const navOffset = baseNav - (i * baseNav * 0.005) + (baseNav * randPercentage);
          const changeAmt = i === 9 ? 0 : navOffset - (baseNav - ((i + 1) * baseNav * 0.005));
          const changePct = i === 9 ? 0 : (changeAmt / navOffset) * 100;

          const date = new Date();
          date.setDate(date.getDate() - i);

          await pool.query(
            `
            INSERT INTO mutual_fund_price_history (fund_id, nav, change_amount, change_percentage, created_at)
            VALUES ($1, $2, $3, $4, $5)
            `,
            [fundId, navOffset, changeAmt, changePct, date]
          );
        }
      }
      console.log("✔ Seeding completed successfully!");
    }
  } catch (error) {
    console.error("❌ Schema initialization error:", error);
    throw error;
  }
};
