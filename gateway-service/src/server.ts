import express, { Request, Response, NextFunction } from "express";

import axios, { AxiosRequestConfig, Method } from "axios";

import cors from "cors";



const app = express();

app.use(cors());

app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);


const API = "http://192.168.1.5:4000";

/*
|--------------------------------------------------------------------------
| SERVICE URLS
|--------------------------------------------------------------------------
*/

const SERVICES = {
  AUTH: "http://localhost:5000",
  MUTUAL_FUNDS: "http://localhost:5001",
  STOCKS: "http://localhost:5002",
};

/*
|--------------------------------------------------------------------------
| PROXY HANDLER
|--------------------------------------------------------------------------
*/

const createProxy =
  (target: string) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const config: AxiosRequestConfig = {
        method: req.method as Method,

        url: `${target}${req.originalUrl}`,

        data: req.body,

        params: req.query,

        headers: {
          "Content-Type": "application/json",
          Authorization: req.headers.authorization || "",
        },
      };

      const response = await axios(config);

      res.status(response.status).json(response.data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Internal Server Error",
      });
    }
  };

/*
|--------------------------------------------------------------------------
| AUTH SERVER
|--------------------------------------------------------------------------
*/

app.use("/api/auth", createProxy(SERVICES.AUTH));

app.use("/api/investors", createProxy(SERVICES.AUTH));

/*
|--------------------------------------------------------------------------
| MUTUAL FUND SERVER
|--------------------------------------------------------------------------
*/

app.use("/api/mutualfunds", createProxy(SERVICES.MUTUAL_FUNDS));

app.use("/api/sips", createProxy(SERVICES.MUTUAL_FUNDS));

/*
|--------------------------------------------------------------------------
| STOCK SERVER
|--------------------------------------------------------------------------
*/

app.use("/api/stocks", createProxy(SERVICES.STOCKS));

/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "API Gateway Running",
  });
});

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

const PORT: number = 4000;

app.listen(PORT, "0.0.0.0", (): void => {
  console.log(`API Gateway running on port ${PORT}`);
});
