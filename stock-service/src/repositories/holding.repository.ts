import { PoolClient } from "pg";



export const reduceHolding = async (
  client: PoolClient,
  holding: any,
  sellQuantity: number,
) => {
  const remainingQuantity = Number(holding.quantity) - sellQuantity;

  if (remainingQuantity <= 0) {
    await client.query(
      `
      DELETE FROM holdings
      WHERE holding_id = $1
      `,
      [holding.holding_id],
    );

    return;
  }

  const avgPrice = Number(holding.average_buy_price);

  const remainingInvestment = remainingQuantity * avgPrice;

  await client.query(
    `
    UPDATE holdings
    SET
      quantity = $1,

      total_invested = $2,

      current_value =
        $1 * current_market_price,

      unrealized_profit =
        ($1 * current_market_price)
        - $2,

      last_updated = NOW()

    WHERE holding_id = $3
    `,
    [remainingQuantity, remainingInvestment, holding.holding_id],
  );
};