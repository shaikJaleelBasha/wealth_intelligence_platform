import pool from "../config/db";

/*
|--------------------------------------------------------------------------
| BUY STOCK
|--------------------------------------------------------------------------
*/

export const buyStock = async (user: any, data: any) => {
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

    console.log("Investor Result:", investorResult.rows);

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
    | VALIDATE QUANTITY
    |--------------------------------------------------------------------------
    */

    if (Number(data.quantity) <= 0) {
      throw new Error("Invalid quantity");
    }

    /*
    |--------------------------------------------------------------------------
    | AVAILABLE MARKET QUANTITY
    |--------------------------------------------------------------------------
    */

    if (Number(data.quantity) > Number(stock.available_quantity)) {
      throw new Error("Insufficient market quantity");
    }

    /*
    |--------------------------------------------------------------------------
    | TOTAL AMOUNT
    |--------------------------------------------------------------------------
    */

    const totalAmount = Number(stock.current_price) * Number(data.quantity);

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
          total_amount,
          order_status
        )
        VALUES
        (
          $1,
          $2,
          'BUY',
          'MARKET',
          $3,
          $4,
          $5,
          'COMPLETED'
        )
        RETURNING *
      `,
      [
        portfolio.portfolio_id,

        stock.stock_id,

        data.quantity,

        stock.current_price,

        totalAmount,
      ],
    );

    /*
    |--------------------------------------------------------------------------
    | UPDATE MARKET STOCK QUANTITY
    |--------------------------------------------------------------------------
    */

    await client.query(
      `
      UPDATE stocks
      SET
        available_quantity =
          available_quantity - $1
      WHERE stock_id = $2
    `,
      [data.quantity, stock.stock_id],
    );

    /*
    |--------------------------------------------------------------------------
    | CHECK HOLDINGS
    |--------------------------------------------------------------------------
    */

    const holdingResult = await client.query(
      `
        SELECT *
        FROM holdings
        WHERE portfolio_id = $1
        AND asset_id = $2
      `,
      [portfolio.portfolio_id, stock.stock_id],
    );

    /*
    |--------------------------------------------------------------------------
    | NEW HOLDING
    |--------------------------------------------------------------------------
    */

    if (holdingResult.rows.length === 0) {
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
          NOW()
        )
      `,
        [
          portfolio.portfolio_id,

          stock.stock_id,

          data.quantity,

          stock.current_price,

          totalAmount,

          stock.current_price,

          totalAmount,
        ],
      );
    } else {
      /*
      |--------------------------------------------------------------------------
      | UPDATE EXISTING HOLDING
      |--------------------------------------------------------------------------
      */

      const holding = holdingResult.rows[0];

      const updatedQuantity = Number(holding.quantity) + Number(data.quantity);

      const updatedInvestment = Number(holding.total_invested) + totalAmount;

      const avgPrice = updatedInvestment / updatedQuantity;

      const currentValue = updatedQuantity * Number(stock.current_price);

      const profit = currentValue - updatedInvestment;

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

          avgPrice,

          updatedInvestment,

          stock.current_price,

          currentValue,

          profit,

          holding.holding_id,
        ],
      );
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE PORTFOLIO
    |--------------------------------------------------------------------------
    */

    const updatedInvestment =
      Number(portfolio.total_investment || 0) + totalAmount;

    const updatedCurrentValue =
      Number(portfolio.current_value || 0) + totalAmount;

    await client.query(
      `
      UPDATE portfolios
      SET
        total_investment = $1,
        current_value = $2,
        updated_at = NOW()

      WHERE portfolio_id = $3
    `,
      [updatedInvestment, updatedCurrentValue, portfolio.portfolio_id],
    );

    /*
    |--------------------------------------------------------------------------
    | COMMIT
    |--------------------------------------------------------------------------
    */

    await client.query("COMMIT");

    return {
      success: true,

      message: "Stock purchased successfully",

      transaction: transactionResult.rows[0],
    };
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | ROLLBACK
    |--------------------------------------------------------------------------
    */

    await client.query("ROLLBACK");

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
  return {
    message: "Sell stock working",
  };
};

/*
|--------------------------------------------------------------------------
| ORDER HISTORY
|--------------------------------------------------------------------------
*/

export const orderHistory = async (user: any) => {
  return [];
};
