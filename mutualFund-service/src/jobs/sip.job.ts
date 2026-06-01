import cron from "node-cron";
import { processDueSips } from "../services/sip.service";

export const initSipJob = () => {
  // Run everyday at midnight (0 0 * * *)
  // For easy demo/testing, we also trigger it once at startup
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("Running scheduled daily SIP process job...");
      await processDueSips();
    } catch (error) {
      console.error("Scheduled SIP job error:", error);
    }
  });

  console.log("✔ Daily SIP Installment Cron Job Initialized");

  // Run immediately on start (asynchronous, non-blocking)
  setTimeout(async () => {
    try {
      console.log("Running initial startup SIP check...");
      await processDueSips();
    } catch (error) {
      console.error("Startup SIP check error:", error);
    }
  }, 5000);
};
