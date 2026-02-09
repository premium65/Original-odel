//  import packages
import express from "express"
import passport from "passport"
import multer from "multer"
import path from "path"
// import controllers
import * as userCtrl from "../controllers/user.controller"
import * as pkgCtrl from "../controllers/package.controller"
import * as anouncementCtrl from "../controllers/anouncement.controller"
import * as commonCtrl from "../controllers/common.controller"
import * as referralCtrl from "../controllers/referral.controller"
import * as faqCtrl from "../controllers/faq.controller"
import * as cmsCtrl from "../controllers/cms.controller"
import * as eventCtrl from "../controllers/event.controller"
import * as policyCtrl from "../controllers/policy.controller"
// import validation
import * as userValid from "../validation/user.validation"
import imageFilter from "../lib/imageFilter"
const router = express()
const passportAuth = passport.authenticate("usersAuth", { session: false })

// MULTER
const storageQr = multer.diskStorage({
  destination: "./public/images/qr/",
  filename: function (req, file, cb) {
    cb(null, file.fieldname + Date.now() + path.extname(file.originalname))
  },
})

const uploadQrcode = multer({
  storage: storageQr,
})

router
  .route("/policy/:id") // need validation
  .get(policyCtrl.getPolicy)
router
  .route("/help") // need validation
  .get(passportAuth, faqCtrl.getHelp)
router
  .route("/update-bank-details") // need validation
  .post(passportAuth, userValid.updateBankDetail, userCtrl.updateBankDetail)
router
  .route("/update-pending-balance") // need validation
  .post(passportAuth, pkgCtrl.updateWalletPending)
router.route("/update-user-bonus").put(passportAuth, pkgCtrl.updateUserBonus)
router.route("/get-bookings").get(passportAuth, pkgCtrl.getBookings)
router.route("/get-premium-task").get(passportAuth, pkgCtrl.getUserPremium)
router.route("/get-user-bonus-list").get(passportAuth, pkgCtrl.getUserBonusList)
router
  .route("/get-booking-history")
  .get(passportAuth, pkgCtrl.getBookingHistory)
// router.route("/get-package").get(passportAuth, pkgCtrl.getUserPackage);
// router.route("/get-all-package").get(passportAuth, pkgCtrl.getAllPackages);
router.route("/purchase-booking").post(passportAuth, pkgCtrl.purchase)
router
  .route("/get-account-details")
  .get(passportAuth, userCtrl.getAccountDetails)
router
  .route("/update-profile-pic")
  .post(passportAuth, userCtrl.uploadProfile, userCtrl.updateProfileImage)
router.route("/update-gender").post(passportAuth, userCtrl.updateGender)
router
  .route("/setting")
  .get(passportAuth, userCtrl.getUserSetting)
  .put(passportAuth, userValid.editSettingValid, userCtrl.editUserSetting)
router
  .route("/bankdetail")
  .post(passportAuth, userValid.editBankValidate, userCtrl.updateBankDetail)
  .put(passportAuth, userValid.deleteBankValidate, userCtrl.deleteBankDetail)
  .patch(passportAuth, userValid.deleteBankValidate, userCtrl.setPrimaryBank)
  .get(passportAuth, userCtrl.getBankDetail)
// UPI
router
  .route("/upidetail")
  .post(passportAuth, userCtrl.updateUPIDetail)
  .put(passportAuth, userCtrl.deleteUPIDetail)
  .get(passportAuth, userCtrl.getUPIDetail)
router
  .route("/primaryupi")
  .post(passportAuth, userValid.deleteUPIValidate, userCtrl.setPrimaryUPI)
// QR CODE
router
  .route("/qrdetail")
  .post(passportAuth, uploadQrcode.single("qrImage"), userCtrl.updateQRDetail)
  .put(passportAuth, userCtrl.deleteQRDetail)
  .get(passportAuth, userCtrl.getQRDetail)
router.route("/primaryqr").post(passportAuth, userCtrl.setPrimaryQR)

router
  .route("/profile")
  .get(passportAuth, userCtrl.getUserProfile)
  .put(passportAuth, userValid.editProfileValidate, userCtrl.editUserProfile)
router
  .route("/updateProfileImage")
  .put(passportAuth, userCtrl.updateProfileImage)
router
  .route("/changePassword")
  .post(passportAuth, userValid.changePwdValidate, userCtrl.changePassword)
router
  .route("/phoneChange")
  .post(passportAuth, userValid.newPhoneValidate, userCtrl.changeNewPhone)
  .put(passportAuth, userValid.editPhoneValidate, userCtrl.verifyNewPhone)
router.route("/loginHistory").get(passportAuth, userCtrl.getLoginHistory)
router.route("/announcement").get(passportAuth, anouncementCtrl.getAnnouncement)
router.route("/getbranddetails").get(commonCtrl.getbranddetails)
router
  .route("/editNotif")
  .put(passportAuth, userValid.editNotifValid, userCtrl.editNotif)

//Referral
router
  .route("/getReferralRewardHistory")
  .get(passportAuth, referralCtrl.getReferralRewardHistory)
router
  .route("/getReferralHisotry")
  .get(passportAuth, referralCtrl.getReferralHisotry)
router
  .route("/getReferralDetails")
  .get(passportAuth, referralCtrl.getReferralDetails)

//contact us
router.route("/addContactus").post(commonCtrl.addContactus)
//faq
router.route("/faq").get(faqCtrl.getFaqWithCategory)
//cms
router.route("/cms/:identifier").get(cmsCtrl.getCMSPage)

router.route("/home-cms/:identifier").get(cmsCtrl.getHomecms)
router.route("/cmcContent/:identifier").get(cmsCtrl.getCmsContent)
router.route("/type-cms/:type").get(cmsCtrl.getTypeCms)
//siteSetting
router.route("/siteSetting").get(passportAuth, commonCtrl.getsiteSetting)

//Subscribe
router.route("/newsLetter/subscribe").post(commonCtrl.newSubscribe)

//Slider Management
router.route("/slider").get(commonCtrl.GetSlider)
router.route("/getEvents").get(eventCtrl.getBanners)

// Review section
router.route("/review-section").get(commonCtrl.getReviewPlace)
export default router
