//  import packages
import express from "express";

// import controllers
import * as authCtrl from "../controllers/auth.controller";

// import validation
import * as userValid from "../validation/user.validation";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: "Too many requests from this IP, please try again later.",
});

const router = express();
router
  .route("/register-request")
  .post(limiter,userValid.registerValidate, authCtrl.registerRequest);
router.route("/login").post(userValid.loginValidate, authCtrl.userLogin);
router
  .route("/resetPassword")
  .post(userValid.resetPwdValidate, authCtrl.resetPassword);
export default router;
