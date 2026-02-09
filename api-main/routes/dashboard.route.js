//  import packages
import express from "express";
import passport from 'passport';

// import controllers
import * as dashboardCtrl from "../controllers/dashboard.controller";

const router = express();
const passportAuth = passport.authenticate("usersAuth", { session: false });

// router.route("/lifeTimeReward").get(passportAuth, dashboardCtrl.LifeTimeReward);

export default router;