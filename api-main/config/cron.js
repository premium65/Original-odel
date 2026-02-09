// import package
import cron from "node-cron";

// import config
import config from "../config";


export const commissionFeeZeroCron = cron.schedule(
  "0 0 * * *",
  () => {
    require("../controllers/package.controller").commissionZero();
  },
  {
    scheduled: false,
  }
);