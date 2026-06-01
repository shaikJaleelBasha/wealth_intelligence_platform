import { Response } from "express";

import { AuthRequest } from "../middlewares/auth.middleware";

import * as portfolioService from "../services/portfolio.service";

/*
|--------------------------------------------------------------------------
| GET MY PORTFOLIOS
|--------------------------------------------------------------------------
*/

export const getMyPortfolios = async (req: AuthRequest, res: Response) => {
  try {
    const portfolios = await portfolioService.fetchMyPortfolios(
      Number(req.user.user_id),
    );

    res.status(200).json(portfolios);
  } catch (error: any) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
