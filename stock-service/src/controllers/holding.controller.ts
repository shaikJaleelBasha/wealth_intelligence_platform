import { Response } from "express";

import { AuthRequest } from "../middlewares/auth.middleware";

import * as holdingService from "../services/holding.service";

/*
|--------------------------------------------------------------------------
| GET HOLDINGS
|--------------------------------------------------------------------------
*/

export const getHoldings = async (req: AuthRequest, res: Response) => {
  try {
    const holdings = await holdingService.fetchHoldings(req.user.user_id);

    res.status(200).json(holdings);
  } catch (error: any) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
