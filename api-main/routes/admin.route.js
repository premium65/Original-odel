//  import packages
import express from "express"
import passport from "passport"

import multer from "multer"
import path from "path"

// import controllers
import * as adminCtrl from "../controllers/admin.controller"
import * as userCtrl from "../controllers/user.controller"
import * as commonCtrl from "../controllers/common.controller"
import * as cmsCtrl from "../controllers/cms.controller"
import * as siteSettingCtrl from "../controllers/siteSetting.controller"
import * as smsCtrl from "../controllers/smslog.controller"
import * as faqCtrl from "../controllers/faq.controller"
import * as ProfitCtrl from "../controllers/adminProfit.controller"
import * as eventCtrl from "../controllers/event.controller"
import * as dashboardCtrl from "../controllers/dashboard.controller"
import * as policyCtrl from "../controllers/policy.controller"
// import validation
import * as adminValid from "../validation/admin.validation"
import * as dateValid from "../validation/dateValidation"
import * as userKycValid from "../validation/userKyc.validation"
import * as emailTemplateValid from "../validation/emailTemplate.validation"
import * as userValid from "../validation/user.validation"
import * as siteSettingsValid from "../validation/siteSettings.validation"
import * as eventValid from "../validation/event.validation"
import * as packageCtrl from "../controllers/package.controller"
import * as walletCtrl from "../controllers/wallet.controller"
import * as pkgCtrl from "../controllers/package.controller"
import * as bkpCtrl from "../controllers/backup.controller"

const router = express()
const passportAuth = passport.authenticate("adminAuth", { session: false })

// MULTER
const storageQr = multer.diskStorage({
  destination: "./public/images/slider/",
  filename: function (req, file, cb) {
    cb(null, file.fieldname + Date.now() + path.extname(file.originalname))
  },
})

const uploadSliderImage = multer({
  storage: storageQr,
})

const storage = multer.diskStorage({
  destination: "./public/events",
  filename: function (req, file, cb) {
    cb(null, file.fieldname + Date.now() + path.extname(file.originalname))
  },
})

const uploadEventImage = multer({ storage })

// Passbook Details
router.route("/passbook").get(passportAuth, adminCtrl.getPassbookDetails)

// dashboard data

router
  .route("/get-dashboard-data")
  .get(passportAuth, dashboardCtrl.getDashboardData)
//withdraw
router
  .route("/get-withdraw-req")
  .get(passportAuth, walletCtrl.getWithdrawRequests)
router
  .route("/approve-withdraw-req")
  .put(passportAuth, walletCtrl.approveWithdrawRequest)
router
  .route("/reject-withdraw-req")
  .put(passportAuth, walletCtrl.rejectWithdrawRequest)

// router
//   .route("/decline-withdraw-req")
//   .put(passportAuth, walletCtrl.declineWithdrawRequest);

router
  .route("/get-deposit-list")
  .get(passportAuth, walletCtrl.getDepositHistory)

router
  .route("/get-bonus-history-list")
  .get(passportAuth, walletCtrl.getBonusHistoryList)

// booking
router
  .route("/add-booking")
  .post(passportAuth, packageCtrl.uploadLandscape, packageCtrl.addBooking)
router.route("/add-bonus").post(passportAuth, packageCtrl.addBonus)
router.route("/update-bonus").put(passportAuth, packageCtrl.updateBonus)
router.route("/single-bonus/:id").get(passportAuth, packageCtrl.getSingleBonus)
router.route("/get-bonus-list").get(passportAuth, packageCtrl.getBonusList)
router
  .route("/update-booking")
  .put(passportAuth, packageCtrl.uploadLandscape, packageCtrl.addBooking)
// Premium
router
  .route("/premium-booking-cancel")
  .put(passportAuth, packageCtrl.premiumTaskCancel)
router
  .route("/premium-history")
  .get(passportAuth, packageCtrl.premiumTaskHistory)
router
  .route("/pre-booking-update")
  .put(passportAuth, packageCtrl.premiumTaskUpdate)

  .post(passportAuth, packageCtrl.premiumTaskEdit)
  .get(passportAuth, packageCtrl.getPremiumTask)
router.route("/premium-task").get(passportAuth, adminCtrl.getUserPremiumDetails)
router
  .route("/get-all-bookings")
  .get(packageCtrl.uploadLandscape, packageCtrl.getAllBookings)
router.route("/get-single-booking").get(packageCtrl.getSingleBooking)
router
  .route("/get-bookings-by-filter")
  .get(passportAuth, packageCtrl.getBookingByFilter)
// router
//   .route("/package")
//   .post(passportAuth, packageCtrl.addPackage)
//   .get(passportAuth, packageCtrl.getSinglePackage)
//   .put(passportAuth, packageCtrl.updatePackage);
// router.route("/get-all-packages").get(passportAuth, packageCtrl.getAllPackages);

//admin
router
  .route("/get-unregistered-users")
  .get(passportAuth, adminCtrl.getUnRegUsers)
router.route("/get-user-asset").get(passportAuth, adminCtrl.getUserAsset)
router.route("/update-user-asset").put(passportAuth, adminCtrl.updateUserAsset)
router
  .route("/user-task-update")
  .post(passportAuth, adminCtrl.updateUserTaskcount)
  .put(passportAuth, adminCtrl.resetUserTask)
router
  .route("/update-user-password")
  .put(passportAuth, adminCtrl.updateUserPassword)
router
  .route("/register-approval")
  .post(passportAuth, adminCtrl.approveRegistration)

router.route("/login").post(adminValid.loginValidate, adminCtrl.adminLogin)
router
  .route("/forgotPassword")
  .post(adminValid.forgetPassword, adminCtrl.forgetPassword)
router
  .route("/resetPassword")
  .post(adminValid.resetPassword, adminCtrl.resetPassword)
router.route("/getadmindetail").get(passportAuth, adminCtrl.getAdmindata)
router
  .route("/IpRestriction")
  .post(adminValid.addIpAddress, commonCtrl.addIpRestrict)
  .get(commonCtrl.getIpRestrictData)
  .delete(commonCtrl.deleteIp)

router
  .route("/modules")
  .post(passportAuth, adminValid.ModuleValid, adminCtrl.addModules)
  .get(passportAuth, adminCtrl.getmodules)
  .put(passportAuth, adminValid.ModuleValid, adminCtrl.updateModules)
  .delete(passportAuth, adminCtrl.deletemodule)
router.route("/singlemodule/:id").get(passportAuth, adminCtrl.getsingelmodules)
router.route("/getModules").get(passportAuth, adminCtrl.modules)
router
  .route("/submodules")
  .post(passportAuth, adminValid.SubModuleValid, adminCtrl.addSubModule)
  .get(passportAuth, adminCtrl.getsubmodules)
  .put(passportAuth, adminValid.SubModuleValid, adminCtrl.updateSubModules)
  .delete(passportAuth, adminCtrl.deletesubmodule)
router
  .route("/singlesubmodule/:id")
  .get(passportAuth, adminCtrl.getsinglesubmodule)
router.route("/getsinglerole/:id").get(passportAuth, adminCtrl.getSingleRole)
router.route("/getrole").get(passportAuth, adminCtrl.getrole)

router
  .route("/sub-admin")
  .post(passportAuth, adminValid.SubAdminValid, adminCtrl.createAdmin)
  .delete(passportAuth, adminCtrl.deleteAdmin)
  .get(passportAuth, adminCtrl.getadmin)
router.route("/subAdmin/:id").get(passportAuth, adminCtrl.getsingleadmin)
router.route("/getPath").get(passportAuth, adminCtrl.getpath)
router
  .route("/edit-admin")
  .post(passportAuth, adminValid.updateAdminValid, adminCtrl.editadmin)
router.route("/login-history").get(passportAuth, adminCtrl.LoginhistoryPag)

router.route("/getSubModules").get(passportAuth, adminCtrl.submodules)
router
  .route("/rolemanage")
  .get(passportAuth, adminCtrl.getRole)
  .post(passportAuth, adminValid.RoleValidation, adminCtrl.addRole)
  .put(passportAuth, adminValid.RoleValidation, adminCtrl.updateRole)
router.route("/getsinglerole/:id").get(passportAuth, adminCtrl.getSingleRole)
router.route("/getrole").get(passportAuth, adminCtrl.getrole)

//user
router
  .route("/user")
  .get(passportAuth, dateValid.dateValidation, userCtrl.getUserList)
router.route("/user-locked").put(passportAuth, userCtrl.userLocked)
//site setting
router
  .route("/getSiteSetting")
  .get(passportAuth, siteSettingCtrl.getSiteSetting)
// router.route("/updateSiteSetting").put(passportAuth, siteSettingCtrl.updateSiteSetting);
router.route("/updateSiteDetails").put(
  passportAuth,
  // siteSettingCtrl.uploadSiteDetails,
  // siteSettingsValid.siteSettingsValid,
  siteSettingCtrl.updateSiteDetails
)

//CMS
router
  .route("/cms")
  .get(passportAuth, cmsCtrl.getCmsList)
  .put(passportAuth, cmsCtrl.updateCms)
  .post(passportAuth, cmsCtrl.addCms)
router.route("/getcms/:id").get(cmsCtrl.getSingleCms)

router
  .route("/policy")
  .get(passportAuth, policyCtrl.getPolicyList)
  .put(passportAuth, policyCtrl.updatePolicy)

router.route("/policy/:id").get(policyCtrl.getSinglePolicy)

//common
router
  .route("/contactus")
  .get(passportAuth, commonCtrl.getcontactus)
  .put(passportAuth, commonCtrl.removecotactus)
router
  .route("/replycontact")
  .post(passportAuth, userValid.replyContact, userCtrl.replyContact)
router.route("/contact/find-id/:id").get(passportAuth, userCtrl.findContact)

// FAQ
router
  .route("/faqCategory")
  .get(passportAuth, faqCtrl.listFaqCategory)
  .post(passportAuth, faqCtrl.addFaqCategory)
  .put(passportAuth, faqCtrl.updateFaqCategory)
  .delete(passportAuth, faqCtrl.deleteFaqCategory)
router.route("/getcategory/:id").get(faqCtrl.getSingleFaqCategory)
router.route("/getFaqCategory").get(passportAuth, faqCtrl.getFaqCategory)
router
  .route("/faq")
  .get(passportAuth, faqCtrl.listFaq)
  .post(passportAuth, faqCtrl.addFaq)
  .put(passportAuth, faqCtrl.updateFaq)
  .delete(passportAuth, faqCtrl.deleteFaq)
router.route("/getFaq/:id").get(passportAuth, faqCtrl.getSingleFaq)

//getprofile
router
  .route("/adminProfile")
  .get(passportAuth, adminCtrl.getAdminProfile)
  .put(passportAuth, adminValid.updateProfile, adminCtrl.updateProfile)
  .post(passportAuth, adminValid.changePassword, adminCtrl.changePassword)

//smslog
router.route("/smslog").get(passportAuth, smsCtrl.getsmslog)
//enable admin 2fa
router.route("/2fa-status").get(passportAuth, adminCtrl.get2FAStatus)

router
  .route("/2fa")
  .get(passportAuth, adminCtrl.get2faCode)
  .put(passportAuth, adminValid.update2faValid, adminCtrl.update2faCode)
  .patch(passportAuth, adminValid.update2faValid, adminCtrl.diabled2faCode)

//Slider Management
router
  .route("/slider")
  .get(passportAuth, commonCtrl.GetSlider)
  .post(
    passportAuth,
    uploadSliderImage.single("sliderImage"),
    commonCtrl.AddSlider
  )
  .delete(passportAuth, commonCtrl.DeleteSlider)
router.route("/checkauthtoken").post(adminCtrl.CheckAuthToken)
router.route("/getAdmin-2FA").get(passportAuth, adminCtrl.getAdmin2FA)

// Events
router
  .route("/events")
  .get(passportAuth, eventCtrl.getAllEvents)
  .post(
    passportAuth,
    uploadEventImage.fields([
      { name: "deskView", maxCount: 1 },
      { name: "mobileView", maxCount: 1 },
    ]),
    eventCtrl.createEvent
  )
  .put(
    passportAuth,
    uploadEventImage.fields([
      { name: "deskView", maxCount: 1 },
      { name: "mobileView", maxCount: 1 },
    ]),
    eventCtrl.updateEvent
  )
  .delete(passportAuth, eventCtrl.deleteEvent)

router.route("/single-event/:id").get(passportAuth, eventCtrl.getSingleEvent)
router.route("/user-locked").put(passportAuth, userCtrl.userLocked)

router
  .route("/review-address")
  .get(passportAuth, adminCtrl.getAllAddresses)
  .post(passportAuth, adminCtrl.createAddresses)
router
  .route("/review-address/:id")
  .delete(passportAuth, adminCtrl.deleteAddress)

router
  .route("/review-landmark")
  .get(passportAuth, adminCtrl.getAllLandmarks)
  .post(passportAuth, adminCtrl.createLandmarks)
router
  .route("/review-landmark/:id")
  .delete(passportAuth, adminCtrl.deleteLandmarks)

// admin logs

router.route("/admin-logs-data").get(passportAuth, adminCtrl.getAdminLogsData)
router.route("/admins").get(passportAuth, adminCtrl.getAdmins)
router.route("/backup").get(passportAuth, bkpCtrl.getBackupDBdata)
export default router
