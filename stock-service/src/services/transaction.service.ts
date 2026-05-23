import  pool  from "../config/db";

export const buyStock = async (data: any) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const stockResult = await client.query(
      `SELECT * FROM stocks WHERE stock_id = $1`,
      [data.stock_id],
    );

    const stock = stockResult.rows[0];

    if (!stock) {
      throw new Error("Stock not found");
    }

    const totalAmount = Number(stock.current_price) * Number(data.quantity);

    const transactionQuery = `
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
      VALUES ($1,$2,'BUY','MARKET',$3,$4,$5,'COMPLETED')
      RETURNING *
    `;

    const transactionValues = [
      data.portfolio_id,
      data.stock_id,
      data.quantity,
      stock.current_price,
      totalAmount,
    ];

    const transactionResult = await client.query(
      transactionQuery,
      transactionValues,
    );

    await client.query("COMMIT");

    return transactionResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
