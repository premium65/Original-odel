// import package
import mongoose from "mongoose"
import { generateSecret, verifyToken } from "node-2fa"
import moment from "moment"
import csv from "csv-express"
import { removeKycDbFile } from "../lib/removeFile"

// import modal
import {
  User,
  UserSetting,
  UserKyc,
  Assets,
  SiteSetting,
  ipAddress,
  Notification,
  Contact,
  LoginHistory,
  AdminLogs,
} from "../models"

// import controller
// import { mailTemplateLang } from "./emailTemplate.controller";
// import { createUserKyc } from "./userKyc.controller";
// import * as binanceCtrl from "./binance.controller";
// import * as walletCtrl from "./wallet.controller";
// import {deposit_ETH_Suscription,tokenDepositSuscription} from './coin/eth.controller'

// // import config
import config from "../config"

// import lib
import isEmpty from "../lib/isEmpty"
import { momentFormat, momentFormatForDownload } from "../lib/dateTimeHelper"
import capitalize from "../lib/capitalize"

import {
  paginationQuery,
  filterSearchQuery,
  columnFillter,
} from "../lib/adminHelpers"
import { decryptObject, decryptString, encryptString } from "../lib/cryptoJS"
import multer from "multer"
import imageFilter from "../lib/imageFilter"

const ObjectId = mongoose.Types.ObjectId

/**
 * Get User Profile
 * METHOD : GET
 * URL : /api/userProfile
 */
export const getUserProfile = (req, res) => {
  User.findOne({ _id: req.user.id }, async (err, userData) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, errors: { messages: "Error on server" } })
    }

    let result = await userProfileDetail(userData)
    return res.status(200).json({ success: true, result: result })
  })
}

/**
 * Edit User Profile
 * METHOD : PUT
 * URL : /api/userProfile
 * BODY : firstName,lastName,blockNo,address,country,state,city,postalCode
 */
export const editUserProfile = async (req, res) => {
  try {
    let reqBody = req.body
    let userData = await User.findOne({ _id: req.user.id })

    userData.firstName = reqBody.firstName
    userData.lastName = reqBody.lastName
    userData.blockNo = reqBody.blockNo
    userData.address = reqBody.address
    userData.country = reqBody.country
    userData.state = reqBody.state
    userData.city = reqBody.city
    userData.postalCode = reqBody.postalCode

    let updateUserData = await userData.save()
    let result = userProfileDetail(updateUserData)

    return res.status(200).json({
      success: false,
      message: "PROFILE_EDIT_SUCCESS",
      result: result,
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: "SOMETHING_WRONG" })
  }
}

const profileStorage = multer.diskStorage({
  destination: "./public/images/profile/",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + Date.now() + ".png")
  },
})

const profileLoader = multer({
  storage: profileStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 500 * 1024 },
}).single("profilePic")

export const uploadProfile = async (req, res, next) => {
  try {
    profileLoader(req, res, function (err) {
      if (!isEmpty(req.fileValidationError)) {
        console.log(err)
        return res.status(400).json({ success: false, message: err.message })
      }
      if (err instanceof multer.MulterError) {
        if (err.code == "LIMIT_FILE_SIZE") {
          console.log(err)
          return res.status(400).json({
            success: false,
            message: "Image should be less than 500KB",
          })
        } else {
          console.log(err)
          res.status(400).json({ success: false, message: err.message })
        }
      } else if (!isEmpty(err)) {
        console.log(err)
        return res
          .status(500)
          .json({ success: false, message: "Something went wrong" })
      }
      return next()
    })
  } catch (error) {
    console.log("----------------", error)
    return res
      .status(500)
      .json({ success: false, message: "Something wents wrong" })
  }
}

/**
 * Edit User Profile profile
 * METHOD : PUT
 * URL : /api/userProfile
 * BODY : firstName,lastName,blockNo,address,country,state,city,postalCode
 */
export const updateProfileImage = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res
        .status(400)
        .json({ success: false, message: "Can't update profile picture" })
    }

    let userData = await User.findOneAndUpdate(
      { _id: req.user.id },
      { profilePic: req.file.path.replace("public", "") }
    )

    return res.status(200).json({
      success: true,
      message: "Profile Pic Updated Successfully",
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: "SOMETHING_WRONG" })
  }
}

export const updateGender = async (req, res) => {
  try {
    const { body } = req
    console.log(body)
    await User.findOneAndUpdate(
      { _id: req.user.id },
      { $set: { gender: body.gender } }
    )

    return res.status(200).json({
      success: true,
      message: "Gender Updated Successfully",
    })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" })
  }
}

export const userProfileDetail = async (userData) => {
  let userKYCData = await UserKyc.findOne({ userId: userData._id })
  let userLoginHistory = await LoginHistory.findOne({
    userId: userData._id,
  }).sort({ _id: -1 })

  let data = {
    _id: userData._id,
    userId: userData.userId,
    profileImage: userData.profileImage,
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    blockNo: userData.blockNo,
    address: userData.address,
    city: userData.city,
    state: userData.state,
    country: userData.country,
    postalCode: userData.postalCode,
    emailStatus: userData.emailStatus,
    phoneStatus: userData.phoneStatus,
    phoneCode: userData.phoneCode,
    phoneNo: userData.phoneNo,
    type: userData.type,
    referralCode: userData.referralCode,
    levelDetails: userData.levelDetails,
    idProof: userKYCData?.idProof.status,
    addressProof: userKYCData?.addressProof.status,
    twoFAStatus: !isEmpty(userData.google2Fa.secret) ? "enabled" : "disabled",
    createAt: moment(userData.createAt).format("DD MMM YYYY"),
    loginHistory: userLoginHistory,
    bankDetails: userData.bankDetails,
    antiphishingcode: userData.antiphishingcode,
    changepassword: userData.changepassword,
    percentage: userData.percentage,
  }

  if (userData.bankDetails && userData.bankDetails.length > 0) {
    let bankDetail = userData.bankDetails.find((el) => el.isPrimary == true)
    if (bankDetail) {
      data.bankDetail["bankName"] = bankDetail.bankName
      data.bankDetail["accountNo"] = bankDetail.accountNo
      data.bankDetail["holderName"] = bankDetail.holderName
      data.bankDetail["bankcode"] = bankDetail.bankcode
      data.bankDetail["country"] = bankDetail.country
      data.bankDetail["city"] = bankDetail.city
    }
  }
  return data
}

/**
 * Update Bank Detail
 * METHOD : POST
 * URL : /api/bankdetail
 * BODY : bankId, bankName,accountNo,holderName,bankcode,country,city,bankAddress,currencyId
 */
export const updateBankDetail = async (req, res) => {
  try {
    let bankDetailsArr = [],
      reqBody = req.body
    let message = ""

    // if(reqBody.holderName)
    // if (!/^[a-zA-Z\s.]+$/.test(reqBody.holderName)) {
    //   return res.status(400).json({
    //     success: false,
    //     errors: { holderName: "Please enter a valid name" },
    //   });
    // }

    await User.updateOne(
      { _id: req.user.id },
      {
        $push: {
          bankDetails: {
            bankName: reqBody.bankName,
            accountNo: reqBody.accountNo,
            phoneNo: reqBody.phoneNo,
            holderName: reqBody.holderName,
            UPI: reqBody?.UPI || "",
            IFSC: reqBody.IFSC,
            countryCode: reqBody.countryCode,
          },
        },
      }
    )

    return res.status(200).json({
      success: true,
      message: "Updated Successfully",
    })
  } catch (err) {
    console.log("----err", err)
    return res.status(500).json({ success: false, message: "SOMETHING_WRONG" })
  }
}

/**
 * GET Bank Detail
 * METHOD : GET
 * URL : /api/bankdetail
 */
export const getBankDetail = (req, res) => {
  User.findOne(
    { _id: req.user.id },
    {
      bankDetails: 1,
      upiDetails: 1,
      qrDetails: 1,
    },
    (err, userData) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Error on server" })
      }
      return res.status(200).json({
        success: true,
        message: "Success",
        result: userData,
      })
    }
  )
}

/**
 * Delete Bank Detail
 * METHOD : PUT
 * URL : /api/bankdetail
 * BODY : bankId
 */

export const deleteBankDetail = async (req, res) => {
  try {
    let reqBody = req.body
    let userData = await User.findOne({ _id: req.user.id })

    let bankDataRemove = userData.bankDetails.id(reqBody.bankId)
    if (userData && userData.bankDetails && userData.bankDetails.length == 1) {
      userData.percentage -= 0
    }
    if (bankDataRemove.isPrimary) {
      let bankDetails = userData.bankDetails.find(
        (el) => el._id.toString() != reqBody.bankId
      )
      if (bankDetails) {
        let bankData = userData.bankDetails.id(bankDetails._id)
        bankData.isPrimary = true
      }
    }

    bankDataRemove.remove()
    let updateData = await userData.save()

    return res.status(200).json({
      success: true,
      message: "BANK_DELETE_SUCCESS",
      result: updateData.bankDetails,
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: "SOMETHING_WRONG" })
  }
}

/**
 * Set Primary Bank
 * METHOD : PATCH
 * URL : /api/bankdetail
 * BODY : bankId
 */
export const setPrimaryBank = async (req, res) => {
  try {
    let reqBody = req.body
    let userData = await User.findOne({ _id: req.user.id })

    let bankData = userData.bankDetails.id(reqBody.bankId)
    if (!bankData) {
      return res.status(400).json({ success: false, message: "NO_DATA" })
    }

    if (!bankData.isPrimary) {
      let isPrimaryId = userData.bankDetails.find((el) => el.isPrimary == true)
      if (isPrimaryId) {
        let isPrimaryData = userData.bankDetails.id(isPrimaryId)
        isPrimaryData.isPrimary = false
      }
      bankData.isPrimary = true
    }

    let updateData = await userData.save()

    return res.status(200).json({
      success: true,
      message: "BANK_SET_PRIMARY_SUCCESS",
      result: updateData.bankDetails,
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: "SOMETHING_WRONG" })
  }
}

/**
 * GET UPI Detail
 * METHOD : GET
 * URL : /api/account/upidetail
 */
export const getUPIDetail = (req, res) => {
  User.findOne(
    { _id: req.user.id },
    {
      upiDetails: 1,
    },
    (err, userData) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Error on server" })
      }
      return res
        .status(200)
        .json({ success: true, message: "Success", result: userData })
    }
  )
}

export const updateUPIDetail = async (req, res) => {
  try {
    let upiDetailsArr = [],
      reqBody = req.body
    //  console.log(reqBody,'----reqBodyreqBodyreqBody')
    let message = ""
    let userData = await User.findOne({ _id: req.user.id })

    if (
      !isEmpty(reqBody.upiId) &&
      mongoose.Types.ObjectId.isValid(reqBody.id)
    ) {
      let upiData = userData.upiDetails.id(reqBody.id)

      if (upiData.isPrimary == false && reqBody.isPrimary == true) {
        let isPrimaryId = userData.upiDetails.find((el) => el.isPrimary == true)
        if (isPrimaryId) {
          let isPrimaryData = userData.upiDetails.id(isPrimaryId)
          isPrimaryData.isPrimary = false
        }
      } else if (upiData.isPrimary == true && reqBody.isPrimary == false) {
        reqBody.isPrimary = true
      }

      upiData.upiId = reqBody.upiId
      upiData.isPrimary = reqBody.isPrimary
      message = "UPI Account Edited Successfully"
    } else {
      if (userData.upiDetails && userData.upiDetails.length > 0) {
        upiDetailsArr = userData.upiDetails

        if (reqBody.isPrimary == true) {
          let upiDetails = userData.upiDetails.find(
            (el) => el.isPrimary == true
          )
          let upiData = userData.upiDetails.id(upiDetails._id)
          upiData.isPrimary = false
        }

        upiDetailsArr.push({
          upiId: reqBody.upiId,
          isPrimary: reqBody.isPrimary,
        })
      } else {
        upiDetailsArr.push({
          upiId: reqBody.upiId,
          isPrimary: true,
        })
      }
      userData.upiDetails = upiDetailsArr
      message = "UPI Account Added Successfully"
    }

    let updateData = await userData.save()

    // let newNotification = new Notification({
    //   description: message,
    //   userId: req.user.id,
    //   type: "General",
    //   category: "UPI Detail",
    // });
    // await newNotification.save();
    return res
      .status(200)
      .json({ success: true, message: message, result: updateData.upiDetails })
  } catch (err) {
    console.log(err, "---err")
    return res.status(500).json({ success: false, message: "SOMETHING_WRONG" })
  }
}

export const deleteUPIDetail = async (req, res) => {
  try {
    let reqBody = req.body
    console.log(reqBody, "reqBodyreqBody")
    let userData = await User.findOne({ _id: req.user.id })

    let upiDataRemove = userData.upiDetails.id(reqBody.id)

    if (upiDataRemove.isPrimary) {
      let upiDetails = userData.upiDetails.find(
        (el) => el._id.toString() != reqBody.id
      )
      if (upiDetails) {
        let upiData = userData.upiDetails.id(upiDetails._id)
        upiData.isPrimary = true
      }
    }

    upiDataRemove.remove()
    let updateData = await userData.save()
    // let newNotification = new Notification({
    //   description: "UPI Account Deleted",
    //   userId: req.user.id,
    //   type: "General",
    //   category: "UPI Detail",
    // });
    // await newNotification.save();
    return res.status(200).json({
      success: true,
      message: "UPI Account Deleted",
      result: updateData.upiDetails,
    })
  } catch (err) {
    console.log(err, "errerr")
    return res.status(500).json({ success: false, message: "SOMETHING_WRONG" })
  }
}

export const setPrimaryUPI = async (req, res) => {
  try {
    let reqBody = req.body
    console.log("body---", reqBody)
    let userData = await User.findOne({ _id: req.user.id })

    let upiData = userData.upiDetails.id(reqBody.id)
    if (!upiData) {
      return res.status(400).json({ success: false, message: "NO_DATA" })
    }

    if (!upiData.isPrimary) {
      let isPrimaryId = userData.upiDetails.find((el) => el.isPrimary == true)
      if (isPrimaryId) {
        let isPrimaryData = userData.upiDetails.id(isPrimaryId)
        isPrimaryData.isPrimary = false
      }
      upiData.isPrimary = true
    }

    let updateData = await userData.save()

    return res.status(200).json({
      success: true,
      message: "Primary UPI Set successfully",
      result: updateData.upiDetails,
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: "SOMETHING_WRONG" })
  }
}

export const updateQRDetail = async (req, res) => {
  try {
    let qrDetailsArr = [],
      reqBody = req.body
    // console.log(reqBody, "----reqBody");
    // console.log(req.file.filename, "-----req.file");
    let message = ""
    let userData = await User.findOne({ _id: req.user.id })
    if (!isEmpty(reqBody.id) && mongoose.Types.ObjectId.isValid(reqBody.id)) {
      let qrData = userData.qrDetails.id(reqBody.id)
      if (qrData.isPrimary == false && reqBody.isPrimary == true) {
        let isPrimaryId = userData.qrDetails.find((el) => el.isPrimary == true)
        if (isPrimaryId) {
          let isPrimaryData = userData.qrDetails.id(isPrimaryId)
          isPrimaryData.isPrimary = false
        }
      } else if (qrData.isPrimary == true && reqBody.isPrimary == false) {
        reqBody.isPrimary = true
      }
      qrData.frontImage = req.file.filename
      qrData.isPrimary = reqBody.isPrimary
      message = "GPay Account Edited Successfully"
    } else {
      if (userData.qrDetails && userData.qrDetails.length > 0) {
        qrDetailsArr = userData.qrDetails
        if (reqBody.isPrimary == true) {
          let qrDetails = userData.qrDetails.find((el) => el.isPrimary == true)
          let qrData = userData.qrDetails.id(qrDetails._id)
          qrData.isPrimary = false
        }

        qrDetailsArr.push({
          frontImage: req.file.filename,
          isPrimary: reqBody.isPrimary,
        })
      } else {
        qrDetailsArr.push({
          frontImage: req.file.filename,
          isPrimary: true,
        })
      }
      // console.log("qrDetailsArr--", qrDetailsArr);
      userData.qrDetails = qrDetailsArr
      message = "Gpay Account Added Successfully"
    }

    let updateData = await userData.save()

    return res
      .status(200)
      .json({ success: true, message: message, result: updateData.qrDetails })
  } catch (err) {
    console.log("Err0r---", err)
    return res.status(500).json({ success: false, message: "SOMETHING_WRONG" })
  }
}

export const deleteQRDetail = async (req, res) => {
  try {
    let reqBody = req.body
    let userData = await User.findOne({ _id: req.user.id })

    let qrDataRemove = userData.qrDetails.id(reqBody.id)

    if (qrDataRemove.isPrimary) {
      let qrDetails = userData.qrDetails.find(
        (el) => el._id.toString() != reqBody.id
      )
      if (qrDetails) {
        let upiData = userData.qrDetails.id(qrDetails._id)
        upiData.isPrimary = true
      }
    }

    qrDataRemove.remove()
    let updateData = await userData.save()
    // let newNotification = new Notification({
    //   description: "Gpay Account Deleted",
    //   userId: req.user.id,
    //   type: "General",
    //   category: "Gpay Detail",
    // });
    // await newNotification.save();
    return res.status(200).json({
      success: true,
      message: "Gpay Account Deleted",
      result: updateData.qrDetails,
    })
  } catch (err) {
    console.log(err, "---err")
    return res.status(500).json({ success: false, message: "SOMETHING_WRONG" })
  }
}

export const getQRDetail = (req, res) => {
  User.findOne(
    { _id: req.user.id },
    {
      qrDetails: 1,
    },
    (err, userData) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Error on server" })
      }
      return res
        .status(200)
        .json({ success: true, message: "Success", result: userData })
    }
  )
}

export const setPrimaryQR = async (req, res) => {
  try {
    let reqBody = req.body
    console.log("body---", reqBody)
    let userData = await User.findOne({ _id: req.user.id })

    let qrData = userData.qrDetails.id(reqBody.id)
    if (!qrData) {
      return res.status(400).json({ success: false, message: "NO_DATA" })
    }

    if (!qrData.isPrimary) {
      let isPrimaryId = userData.qrDetails.find((el) => el.isPrimary == true)
      if (isPrimaryId) {
        let isPrimaryData = userData.qrDetails.id(isPrimaryId)
        isPrimaryData.isPrimary = false
      }
      qrData.isPrimary = true
    }

    let updateData = await userData.save()

    return res.status(200).json({
      success: true,
      message: "Primary QR Set successfully",
      result: updateData.qrDetails,
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: "SOMETHING_WRONG" })
  }
}
/**
 * Change New Password
 * METHOD : POST
 * URL : /api/changePassword
 * BODY : password, confirmPassword, oldPassword
 */
export const changePassword = async (req, res) => {
  try {
    let reqBody = req.body
    reqBody = decryptObject(reqBody.id)
    let userData = await User.findOne({ _id: req.user.id })
    let notify = await UserSetting.findOne({ userId: userData._id })
    if (!userData) {
      return res.status(500).json({ success: false, message: "User not found" })
    }

    if (!userData.authenticate(reqBody.oldPassword)) {
      return res.status(400).json({
        success: false,
        errors: { oldPassword: "Incorrect password" },
      })
    }
    if (userData.authenticate(reqBody.password)) {
      return res.status(400).json({
        success: false,
        errors: { password: "PASSWORD MUST NOT BE THE PREVIOUS ONE" },
      })
    }
    userData.password = reqBody.password
    if (userData && userData.changepassword == false) {
      userData.percentage += 0
    }
    userData.changepassword = true

    await userData.save()

    // if (userData.phoneNo != "" && userData.phoneCode != "" && userData.phoneStatus == "verified" && userData.status == "verified") {
    //   console.log(userData.phoneCode,"Mobileno", userData.phoneNo);
    //   let smsContent = {
    //     to: `+${userData.phoneCode}${userData.phoneNo}`,
    //     body: "Dear User Your Account Password Has Been Changed Successfully.",
    //   };

    //   sentSms(smsContent);
    // }

    let doc = {
      userId: req.user.id,
      title: "Change password ",
      description: "Your password has been updated",
    }
    // newNotification(doc);
    return res
      .status(200)
      .json({ success: true, message: "Password changed successfully" })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" })
  }
}

/**
 * Get 2FA Code
 * METHOD : GET
 * URL : /api/security/2fa
 */
export const get2faCode = async (req, res) => {
  User.findOne({ _id: req.user.id }, (err, userData) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "SOMETHING_WRONG" })
    }
    let result = generateTwoFa(userData)
    return res.status(200).json({ success: true, result: result })
  })
}

/**
 * Get User setting
 * METHOD : GET
 * URL: /api/userSetting
 */
export const getUserSetting = (req, res) => {
  UserSetting.findOne(
    { userId: req.user.id },
    { _id: 0, createdAt: 0, updatedAt: 0 },
    (err, data) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "SOMETHING_WRONG" })
      }
      console.log(data, "data")
      return res
        .status(200)
        .json({ success: true, message: "FETCH_SUCCESS", result: data })
    }
  )
}

/**
 * Edit User Setting
 * METHOD : PUT
 * URL : /api/userSetting
 * BODY : languageId, theme, currencySymbol, timeZone(name,GMT), afterLogin(page,url)
 */
export const editUserSetting = (req, res) => {
  let reqBody = req.body
  UserSetting.findOneAndUpdate(
    { userId: req.user.id },
    {
      LatestEvent: reqBody.LatestEvent,
      announcement: reqBody.announcement,
      tradingviewAlert: reqBody.tradingviewAlert,
      tradeOrderPlaceAlertMobile: reqBody.tradeOrderPlaceAlertMobile,
      tradeOrderPlaceAlertWeb: reqBody.tradeOrderPlaceAlertWeb,
      defaultWallet: reqBody.defaultWallet,
      theme: reqBody.theme,
      currencySymbol: reqBody.currencySymbol,
      languageId: reqBody.languageId,
      twoFA: reqBody.twoFA,
      passwordChange: reqBody.passwordChange,
      loginNotification: reqBody.loginNotification,
    },
    {
      fields: { _id: 0, createdAt: 0, updatedAt: 0 },
      new: true,
    },
    (err, data) => {
      if (err) {
        console.log("errerrerr", err)
        return res
          .status(500)
          .json({ success: false, message: "SOMETHING_WRONG" })
      }
      return res
        .status(200)
        .json({ success: true, message: "EDIT_SETTING_SUCCESS", result: data })
    }
  )
}

/**
 * Edit User Notification
 * METHOD : PUT
 * URL : /api/editNotif
 * BODY : name, checked
 */
export const editNotif = async (req, res) => {
  try {
    let reqBody = req.body
    let usrSetting = await UserSetting.findOne(
      { userId: req.user.id },
      { createdAt: 0, updatedAt: 0 }
    )

    if (!usrSetting) {
      return res.status(400).json({ success: false, message: "NO_DATA" })
    }

    if (reqBody.name in usrSetting) {
      usrSetting[reqBody.name] = reqBody.checked
    }
    let updateData = await usrSetting.save()
    return res.status(200).json({
      success: true,
      message: "EDIT_SETTING_SUCCESS",
      result: {
        currencySymbol: updateData.currencySymbol,
        theme: updateData.theme,
        afterLogin: updateData.afterLogin,
        languageId: updateData.languageId,
        timeZone: updateData.timeZone,
        loginNotification: updateData.loginNotification,
        twoFA: updateData.twoFA,
        passwordChange: updateData.passwordChange,
      },
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: "SOMETHING_WRONG" })
  }
}

/**
 * User Upgrade
 * METHOD : POST
 * URL : /api/upgradeUser
 * BODY : upgradeType(basic,advanced,pro)
 */
export const upgradeUser = async (req, res) => {
  try {
    let reqBody = req.body
    let userData = await User.findOne({ _id: req.user.id })
    if (!userData) {
      return res.status(400).json({ success: false, message: "NO DATA" })
    }

    let usrKyc = await UserKyc.findOne(
      { userId: req.user.id },
      { idProof: 1, addressProof: 1 }
    )

    if (!usrKyc) {
      return res.status(400).json({ success: false, message: "NO DATA" })
    }

    if (
      usrKyc &&
      usrKyc.idProof.status == "approved" &&
      usrKyc.addressProof.status == "approved"
    ) {
      if (
        userData.type == "not_activate" &&
        ["advanced", "pro"].includes(reqBody.upgradeType)
      ) {
        return res.status(400).json({
          success: false,
          message: "You should first verify the BASIC suer account",
        })
      } else if (
        userData.type == "basic" &&
        ["pro"].includes(reqBody.upgradeType)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You should first verify the Basic and the Advanced user account",
        })
      } else if (
        ["basic_processing", "advanced_processing", "pro_processing"].includes(
          userData.type
        )
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Your request are procesing" })
      } else if (
        userData.type == "not_activate" &&
        reqBody.upgradeType == "basic"
      ) {
        userData.type = "basic_processing"
        let updateDoc = await userData.save()

        let result = userProfileDetail(updateDoc)
        return res
          .status(200)
          .json({ success: true, message: "Successfully submitted", result })
      } else if (
        userData.type == "basic" &&
        reqBody.upgradeType == "advanced"
      ) {
        userData.type = "advanced_processing"
        let updateDoc = await userData.save()

        let result = userProfileDetail(updateDoc)
        return res
          .status(200)
          .json({ success: true, message: "Successfully submitted", result })
      } else if (userData.type == "advanced" && reqBody.upgradeType == "pro") {
        userData.type = "pro_processing"
        let updateDoc = await userData.save()

        let result = userProfileDetail(updateDoc)
        return res
          .status(200)
          .json({ success: true, message: "Successfully submitted", result })
      }
    }

    return res
      .status(400)
      .json({ success: false, message: "Please verify the kyc" })
  } catch (err) {
    return res.status(500).json({ success: false, message: "SOMETHING WRONG" })
  }
}

/**
 * Change New Phone
 * METHOD : POST
 * URL : /api/phoneChange
 * BODY : newPhoneCode, newPhoneNo
 */
export const changeNewPhone = async (req, res) => {
  try {
    let reqBody = req.body,
      smsOtp = Math.floor(100000 + Math.random() * 900000)
    // let numValidation = await numverify.validation(reqBody.newPhoneCode + reqBody.newPhoneNo);
    // if (!numValidation.valid) {
    //     return res.status(400).json({ "success": false, 'errors': { 'newPhoneNo': "Incorrect format" } })
    // }

    let checkUser = await User.findOne({
      phoneCode: reqBody.newPhoneCode,
      phoneNo: reqBody.newPhoneNo,
    })
    console.log(checkUser, "checkUsercheckUser")
    if (checkUser) {
      if (checkUser._id.toString() != req.user.id) {
        return res.status(400).json({
          success: false,
          errors: { newPhoneNo: "Mobile number already exists" },
        })
      }
      if (checkUser._id.toString() == req.user.id) {
        return res.status(400).json({
          success: false,
          errors: { newPhoneNo: "Does matched your previous mobile number" },
        })
      }
    }

    let siteSetting = await SiteSetting.findOne({}, { siteName: 1 })
    if (!siteSetting) {
      return res
        .status(500)
        .json({ success: false, message: "SOMETHING_WRONG" })
    }
    let to = `+${reqBody.newPhoneCode}${reqBody.newPhoneNo}`
    // const { smsStatus } = await sentOtp(to);
    // if (!smsStatus) {
    //   return res.status(400).json({
    //     success: false,
    //     errors: { newPhoneNo: "Invalid Mobile Number " },
    //   });
    // }
    // let smsContent = {
    //   to: `+${reqBody.newPhoneCode}${reqBody.newPhoneNo}`,
    //   body: `${firstCapitalize(
    //     siteSetting.siteName
    //   )}Verification Code: ${smsOtp}`,
    // };

    // let { smsStatus } = await sentSms(smsContent);
    // if (!smsStatus) {
    //   return res
    //     .status(500)
    //     .json({ success: false, message: "SOMETHING_WRONG" });
    // }

    await User.updateOne(
      {
        _id: req.user.id,
      },
      {
        newPhone: {
          phoneCode: reqBody.newPhoneCode,
          phoneNo: reqBody.newPhoneNo,
        },
      }
    )
    return res.status(200).json({
      success: true,
      message:
        "Verification code sent successfully, It is only valid for 2 minutes",
    })
  } catch (err) {
    console.log("----err", err)
    return res.status(500).json({ success: false, message: "SOMETHING_WRONG" })
  }
}

/**
 * Verify New Phone
 * METHOD : PUT
 * URL : /api/phoneChange
 * BODY : otp
 */
export const verifyNewPhone = async (req, res) => {
  try {
    let reqBody = req.body,
      otpTime = new Date(new Date().getTime() - 120000) //2 min

    let userData = await User.findOne({
      phoneCode: reqBody.newPhoneCode,
      phoneNo: reqBody.newPhoneNo,
    })
    console.log("validateErrorvalidateError", userData)
    if (userData) {
      if (userData._id.toString() != req.user.id) {
        return res.status(400).json({
          success: false,
          errors: { phoneNumber: "Mobile number already exists" },
          message: "Mobile number already exists",
        })
      }
      if (userData._id.toString() == req.user.id) {
        return res.status(400).json({
          success: false,
          errors: { phoneNumber: "Does matched your previous mobile number" },
          message: "Does matched your previous mobile number",
        })
      }
    }

    // if (userData.otptime <= otpTime) {
    //   return res
    //     .status(400)
    //     .json({ success: false, errors: { otp: "Expiry OTP" } });
    // }

    // if (userData.otp != reqBody.otp) {
    //   return res
    //     .status(400)
    //     .json({ success: false, errors: { otp: "Invalid OTP" } });
    // }
    let checkUser = await User.findOne({
      _id: req.user.id,
    })
    const { status, message } = await optVerification(2, checkUser, reqBody.otp)
    console.log("vbbbbbbbbbbbb", status, message)
    if (!status) {
      return res.status(400).json({ success: false, message })
    }
    // if (userData.newPhone.phoneCode == "" || userData.newPhone.phoneNo == "") {
    //   return res
    //     .status(400)
    //     .json({ success: false, errors: { otp: "Invalid new phone" } });
    // }
    if (checkUser && checkUser.phoneStatus != "verified") {
      checkUser.percentage += 0
    }
    checkUser.phoneCode = reqBody.newPhoneCode
    checkUser.phoneNo = reqBody.newPhoneNo
    checkUser.newPhone.phoneCode = ""
    checkUser.newPhone.phoneNo = ""
    checkUser.requestType = ""
    checkUser.otp = ""
    checkUser.phoneStatus = "verified"

    let updateUserData = await checkUser.save()

    let responseData = {
      phoneCode: updateUserData.phoneCode,
      phoneNo: updateUserData.phoneNo,
      phoneStatus: updateUserData.phoneStatus,
    }
    return res.status(200).json({
      success: true,
      message: "Mobile phone verified",
      result: responseData,
    })
  } catch (err) {
    console.log("validateErrorvalidateError", err)
    return res.status(500).json({ success: false, message: "SOMETHING_WRONG" })
  }
}

/**
 * Get User List
 * METHOD : Get
 * URL : /adminapi/user
 */
export const getUserList = async (req, res) => {
  try {
    let filter = {}
    const seqNo = req.user.seqNo == 0 ? {} : { adminSeqNo: req.user.seqNo }

    filter = columnFillter(req.query, req.headers.timezone)
    // filter = { ...filter, ...seqNo }
    let sortObj = !isEmpty(JSON.parse(req.query.sortObj))
      ? JSON.parse(req.query.sortObj)
      : { _id: -1 }
    let Export = req.query.export
    const header = [
      "Create Date",
      "User Id",
      "Email",
      "Email Status",
      "Phone Status",
      // "Phone Number",
      "Google 2FA",
      "Status",
    ]
    if (Export == "csv" || Export == "xls") {
      // if (req.query.fillter != "" && req.query.fillter != undefined) {
      //   let fillterQuery = columnFillter(req.query, req.headers.timezone);
      //   filter["createdAt"] = fillterQuery.createdAt;
      // }
      let exportData = await User.find(filter, {
        userId: 1,
        email: 1,
        phoneCode: 1,
        phoneNo: 1,
        "google2Fa.secret": 1,
        emailStatus: 1,
        phoneStatus: 1,
        status: 1,
        createdAt: 1,
      }).sort(sortObj)

      let csvData = [header]
      if (exportData && exportData.length > 0) {
        for (let item of exportData) {
          let arr = []
          arr.push(
            momentFormatForDownload(item.createdAt.toString()),
            item.userId,
            item.email,
            capitalize(item.emailStatus),
            capitalize(item.phoneStatus),
            String(item.phoneCode) + String(item.phoneNo),
            !isEmpty(item.google2Fa.secret) ? "Enabled" : "Disabled",
            capitalize(item.status)
          )
          csvData.push(arr)
        }
      }
      console.log(csvData, "csvData")
      return res.csv(csvData)
    } else if (Export == "pdf") {
      // if (req.query.fillter != "" && req.query.fillter != undefined) {
      //   let fillterQuery = columnFillter(req.query, req.headers.timezone);
      //   filter["createdAt"] = fillterQuery.createdAt;
      // }
      let data = await User.find(filter, {
        _id: 1,
        userId: 1,
        email: 1,
        phoneCode: 1,
        phoneNo: 1,
        emailStatus: 1,
        "google2Fa.secret": 1,
        phoneStatus: 1,
        status: 1,
        createdAt: 1,
      })
        .sort(sortObj)
        .exec((err, data) => {
          if (err) {
            return res
              .status(500)
              .json({ success: false, message: "Something went wrong" })
          }
          let reqData = {
            pdfData: data,
          }
          return res
            .status(200)
            .json({ success: true, message: "FETCH", result: reqData })
        })
    } else {
      let pagination = paginationQuery(req.query)
      let query = {
        filter: JSON.stringify({ fillter: JSON.parse(req.query.fillter) }),
      }
      let filter = columnFillter(query, req.headers.timezone)
      // let filter = columnFillter(req.query, req.headers.timezone)

      let sortObj = !isEmpty(JSON.parse(req.query.sortObj))
        ? JSON.parse(req.query.sortObj)
        : { _id: -1 }
      // let filter = filterSearchQuery(req.query, ["email", "status"]);

      let aggregator = [
        {
          $match: {
         ...seqNo,
            role: {
              $ne: "subadmin",
            },
          },
        },
        {
          $lookup: {
            from: "wallet",
            localField: "_id",
            foreignField: "_id",
            as: "wallet",
          },
        },
        {
          $lookup: {
            from: "user",
            localField: "referrer",
            foreignField: "_id",
            as: "referrer",
          },
        },
        {
          $unwind: {
            path: "$wallet",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$referrer",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            createdAt: 1,
            userId: 1,
            userName: 1,
            phoneNo: 1,
            adminApproval: 1,
            totalBalance: { $toString: "$wallet.totalBalance" },
            pendingAmount: { $toString: "$wallet.pendingAmount" },
            totalWithdraw: {
              $toString: { $ifNull: ["$wallet.totalWithdraw", 0] },
            },
            totalDeposit: {
              $toString: { $ifNull: ["$wallet.totalDeposit", 0] },
            },
            referrerId: { $ifNull: ["$referrer.userId", ""] },
            referrerName: { $ifNull: ["$referrer.userName", ""] },
            refCount: 1,
            taskCount: 1,
            userLocked:1,
          },
        },
        {
          $match: filter,
        },
        {
          $facet: {
            count: [
              {
                $count: "count",
              },
            ],
            data: [
              {
                $sort: sortObj,
              },
              {
                $skip: pagination.skip,
              },
              {
                $limit: pagination.limit,
              },
            ],
          },
        },
        {
          $project: {
            count: {
              $arrayElemAt: ["$count.count", 0],
            },
            data: 1,
          },
        },
      ]

      let aggregates = await User.aggregate(aggregator)
      let fetchIp = await ipAddress.find({})

      let result = {
        count: aggregates[0].count,
        data: aggregates[0].data,
        ip: fetchIp,
      }
      return res
        .status(200)
        .json({ success: true, messages: "success", result })
    }
  } catch (err) {
    console.log("....errrrrrr", err)
    return res.status(500).json({ success: false, message: "error on server" })
  }
}

/**
 * Get Balance List
 * METHOD : Get
 * URL : /adminapi/getUserBalanceList
 */
export const getUserBalanceList = async (req, res) => {
  try {
    let pagination = paginationQuery(req.query)
    let filter = filterSearchQuery(req.query, ["currencySymbol"])
    let count = await Assets.countDocuments(filter)

    let data = await Assets.find(filter, {
      currencySymbol: 1,
      spotwallet: 1,
      derivativeWallet: 1,
      userId: 1,
      createdAt: 1,
    })
      .skip(pagination.skip)
      .limit(pagination.limit)

    let result = {
      count: count,
      data,
    }

    return res.status(200).json({ success: true, messages: "success", result })
  } catch (err) {
    res.status(500).json({ success: false, message: "error on server" })
  }
}

/**
 * Sent Verification Link to New Email
 * METHOD : PUT
 * URL : /api/emailChange
 * BODY : token
 */
export const sentVerifLink = async (req, res) => {
  try {
    let reqBody = req.body
    let userId = decryptString(reqBody.token, true)

    let userData = await User.findOne({ _id: userId })

    if (userData.newEmailToken != reqBody.token) {
      return res.status(400).json({ success: false, message: "Invalid Link" })
    }

    let encryptToken = encryptString(userData._id, true)
    userData.newEmailToken = encryptToken
    await userData.save()
    return res.status(200).json({
      success: true,
      message: "Verification link sent to your new email address.",
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error on server" })
  }
}

export const userLocked = async (req, res) => {
  try {
    let checkUser = await User.findOne({ _id: req.body.id })
    checkUser.adminApproval = checkUser.adminApproval == false ? true : false

    let data = await checkUser.save()
    let message =
      data.adminApproval == "false"
        ? "User unlocked successfully"
        : "User locked successfully"

    const adminLogs = new AdminLogs({
      adminEmail: req.user.email,
      adminUserId: req.user.id,
      taskType: "USER_BLOCKED",
      userId: checkUser._id,
      userCode: checkUser.userCode,
      taskDescription: `User Blocked`,
    })

    await adminLogs.save()

    if (!isEmpty(data)) {
      return res.status(200).json({ success: true, message: message })
    }
  } catch (err) {
    console.log("...er", err)
    return res.status(500).json({ success: false, message: "error on server" })
  }
}

export const restrictedIp = async (req, res) => {
  try {
    let reqBody = req.body

    if (!isEmpty(reqBody.ip) && isEmpty(reqBody.type)) {
      let check = await ipAddress.findOneAndUpdate({ ip: reqBody.ip })
      if (check) {
        return res
          .status(400)
          .json({ success: false, message: " ip address already blocked " })
      }
      let blockIp = new ipAddress({
        ip: reqBody.ip,
      })
      let data = await blockIp.save()
      if (data) {
        return res
          .status(200)
          .json({ success: true, message: " ip address blocked successfully" })
      }
    }
    if (reqBody.type == "remove") {
      let checkIp = await ipAddress.findOneAndDelete({ ip: reqBody.ip })
      if (checkIp) {
        return res.status(200).json({
          success: true,
          message: " ip address  unblocked successfully",
        })
      }
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "error on server" })
  }
}

/**
 * Get Login History
 * URL : /api/loginHistory
 * METHOD : GET
 */
export const getLoginHistory = async (req, res) => {
  let pagination = paginationQuery(req.query)

  let count = await LoginHistory.countDocuments({ userId: req.user.id })

  LoginHistory.find({
    userId: req.user.id,
  })
    .sort({ createdDate: -1 })
    .limit(pagination.limit)
    .skip(pagination.skip)
    .exec((err, data) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "SOMETHING_WRONG" })
      }
      return res.status(200).json({ success: true, result: data, count: count })
    })
}

/**
 * Get Notification History
 * URL : /api/notificationHistory
 * METHOD : GET
 */
export const getNotificationHistory = async (req, res) => {
  try {
    let pagination = paginationQuery(req.query)
    let count = await Notification.countDocuments({ userId: req.user.id })

    Notification.find({
      userId: req.user.id,
    })
      .sort({ createdAt: -1 })
      .limit(pagination.limit)
      .skip(pagination.skip)
      .exec((err, data) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: "SOMETHING_WRONG" })
        }
        return res.status(200).json({ success: true, result: data, count })
      })
  } catch (err) {
    return res.status(500).json({ success: false, message: "SOMETHING_WRONG" })
  }
}

/**
 * findContact
 * METHOD : GET
 * URL : /api/admin/findContact
 */
export const findContact = async (req, res) => {
  try {
    let data = await Contact.findOne(
      { _id: req.params.id },
      { name: 1, email: 1, message: 1 }
    )
    return res
      .status(200)
      .json({ success: true, messages: "success", result: data })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, errors: { messages: "Error on server" } })
  }
}

/**
 * replyContact
 * METHOD : POST
 * URL : /api/admin/replycontact
 * BODY : reply, _id
 */
export const replyContact = async (req, res) => {
  try {
    console.log("start")
    let contactData = await Contact.findOne({ _id: req.body._id })
    console.log(contactData, "contactData")
    contactData.replyMessage = req.body.reply
    contactData.replied = true
    contactData.status = "deactive"
    await contactData.save()
    return res.status(200).json({
      message: "Reply Mail sent to user. Refreshing data...",
      success: true,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ status: false, message: "error on server" })
  }
}

/**
 * CHECK OTPVerification VERIFICATION CODE
 * METHOD : POST
 * URL : /api/antiphishingcode/getcode/:type
 * BODY : otp, antiphisingcode
 * PARAMS : phone, email, google_auth
 */

export const getAccountDetails = async (req, res) => {
  const data = await User.findOne(
    { _id: req.user.id },
    {
      _id: 1,
      userName: 1,
      phoneNo: 1,
      phoneCode: 1,
      invitationCode: 1,
      userId: 1,
      bankDetails: 1,
      profilePic: 1,
      gender: 1,
      badge: 1,
      taskCount: 1,
    }
  )
  try {
    if (data) {
      return res
        .status(200)
        .json({ success: true, result: { data }, message: "Account Details fetched successfully" })
    } else if (!response) {
      return res.status(400).json({
        success: true,
        result: {},
        message: "There is no wallet for this user",
      })
    }
  } catch (error) {
    console.log("ERROR ON GETACCOUNT DETAILS", error)
    return res.status(500).json({
      success: false,
      message: "Error On Server",
    })
  }
}
