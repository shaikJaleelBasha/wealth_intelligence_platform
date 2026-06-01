import express, { Request, Response, NextFunction } from "express";
import axios, { AxiosRequestConfig, Method } from "axios";
import cors from "cors";
import { Pool } from "pg";
import dotenv from "dotenv";
import { cache } from "./utils/redis";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

/*
|--------------------------------------------------------------------------
| POSTGRES DATABASE CONNECTION FOR CENTRAL LOGGING
|--------------------------------------------------------------------------
*/
const pool = new Pool({
  host: process.env.DB_HOST || "aws-1-ap-southeast-2.pooler.supabase.com",
  port: Number(process.env.DB_PORT || 6543),
  user: process.env.DB_USER || "postgres.quzmnsjegwmsywcanbvs",
  password: process.env.DB_PASSWORD || "9pzO0fJmTda5gSis",
  database: process.env.DB_NAME || "postgres",
  ssl: {
    rejectUnauthorized: false,
  },
  max: 5,
  idleTimeoutMillis: 30000,
});

// Decodes JWT payload without external jsonwebtoken dependency
const decodeJwtPayload = (token: string) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = Buffer.from(base64, "base64").toString("utf8");
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

const roleMap: Record<number, string> = {
  1: "ADMIN",
  2: "INVESTOR",
  3: "SUPPORT",
};

/*
|--------------------------------------------------------------------------
| CENTRAL GATEWAY LOGGING MIDDLEWARE
|--------------------------------------------------------------------------
*/
app.use(async (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Intercept the response writing
  const originalJson = res.json;
  const originalSend = res.send;
  const originalEnd = res.end;

  let logged = false;

  const logRequest = async (statusCode: number) => {
    if (logged) return;
    logged = true;

    const duration = Date.now() - start;
    const ip = req.ip || req.socket.remoteAddress || "";
    let email = "GUEST";
    let role = "GUEST";

    // Extract authorization details
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const payload = decodeJwtPayload(token);
      if (payload) {
        email = payload.email || email;
        role = roleMap[payload.role_id] || role;
      }
    }

    // Skip logs for the logging fetch endpoint to prevent feedback loops!
    if (req.originalUrl.includes("/api/admin/logs")) {
      return;
    }

    try {
      await pool.query(
        `
        INSERT INTO api_logs (method, path, status, duration_ms, ip_address, user_email, role_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [req.method, req.originalUrl, statusCode, duration, ip, email, role]
      );
      // Invalidate audit logs cache key since new log is recorded
      await cache.del("admin:logs:list");
    } catch (err) {
      console.error("Failed to insert API log into Supabase:", err);
    }
  };

  // Listen to response finish event to log accurately
  res.on("finish", async () => {
    await logRequest(res.statusCode);
  });

  next();
});

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
| ADMIN REQUEST LOGS ENDPOINT
|--------------------------------------------------------------------------
|
| Exposes database logs directly to Admin Dashboard.
|--------------------------------------------------------------------------
*/
app.get("/api/admin/logs", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Token missing" });
    }

    const token = authHeader.split(" ")[1];
    const payload = decodeJwtPayload(token);
    if (!payload || roleMap[payload.role_id] !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden. Admin access required" });
    }

    // Check Redis cache first
    const cacheKey = "admin:logs:list";
    const cachedLogs = await cache.get<any[]>(cacheKey);
    if (cachedLogs) {
      return res.status(200).json(cachedLogs);
    }

    const result = await pool.query(
      `
      SELECT * 
      FROM api_logs 
      ORDER BY created_at DESC 
      LIMIT 100
      `
    );

    // Save to cache with 10 seconds TTL
    await cache.set(cacheKey, result.rows, 10);

    return res.status(200).json(result.rows);
  } catch (error: any) {
    console.error("GET ADMIN LOGS ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
});

/*
|--------------------------------------------------------------------------
| SERVICE ROUTINGS
|--------------------------------------------------------------------------
*/
app.use("/api/auth", createProxy(SERVICES.AUTH));
app.use("/api/investors", createProxy(SERVICES.AUTH));

// Mutual funds routing
app.use("/api/mutualfunds", createProxy(SERVICES.MUTUAL_FUNDS));
app.use("/api/sips", createProxy(SERVICES.MUTUAL_FUNDS));

// Stocks & general holdings routing
app.use("/api/stocks", createProxy(SERVICES.STOCKS));
app.use("/api/transactions", createProxy(SERVICES.STOCKS));
app.use("/api/holdings", createProxy(SERVICES.STOCKS));
app.use("/api/portfolios", createProxy(SERVICES.STOCKS));

/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "API Gateway with Logging Running",
  });
});

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/
const PORT: number = 4000;

app.listen(PORT, "0.0.0.0", (): void => {
  console.log(`API Gateway with Request Interceptor running on port ${PORT}`);
});
