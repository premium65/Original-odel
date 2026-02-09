//  import packages
import express from "express";
import passport from "passport";
import multer from "multer";
import path from "path";
import * as walletCtrl from "../controllers/wallet.controller";

const router = express();
const passportAuth = passport.authenticate("usersAuth", { session: false });

// MULTER
const storageQr = multer.diskStorage({
  destination: "./public/images/qr/",
  filename: function (req, file, cb) {
    cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
  },
});

const uploadQrcode = multer({
  storage: storageQr,
});

router
  .route("/get-user-wallet")
  .get(passportAuth, walletCtrl.getUserWallet)
router.route("/withdraw-request").post(passportAuth, walletCtrl.withdrawRequest); 
router.route("/get-transaction-history").get(passportAuth, walletCtrl.getTransactionHistory); 
export default router;
