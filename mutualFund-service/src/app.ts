import express from "express";
import cors from "cors";
import mutualfundRoutes from "./routes/mutualfund.routes";
import sipRoutes from "./routes/sip.routes";

const app = express();

app.use(cors());
app.use(express.json());

/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/
app.use("/api/mutualfunds", mutualfundRoutes);
app.use("/api/sips", sipRoutes);

export default app;
