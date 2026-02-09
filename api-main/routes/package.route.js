//  import packages
import express from "express";

// import controllers

// import validation
import * as userValid from "../validation/user.validation";

const router = express();

router
  .route("/register-request")
  .post(userValid.registerValidate, authCtrl.registerRequest);
router.route("/verifyOtp").post(authCtrl.verifyOtp);
router.route("/login").post(userValid.loginValidate, authCtrl.userLogin);
router
  .route("/forgotPassword")
  .post(userValid.checkForgotPwdValidate, authCtrl.checkForgotPassword);
router
  .route("/resetconfirmMail")
  .post(userValid.confirmMailValidate, authCtrl.ResetconfirmMail);
router
  .route("/resetPassword")
  .post(userValid.resetPwdValidate, authCtrl.resetPassword);
router
  .route("/confirm-mail")
  .post(userValid.activateRegsiterUser, authCtrl.confirmMail);
router.route("/resend-otp").post(authCtrl.resendOTP);
export default router;
