// import package
import mongoose from "mongoose"
import couponCode from "coupon-code"
import { sentOtp, verifyOtpCode } from "./smsGateway"
// import config
import config from "../config"

// import modal
import {
  User,
  ipAddress,
  LoginHistory,
  Language,
  UserSetting,
  Admin,
  ReferTable,
} from "../models"
// import controllers
import { userProfileDetail } from "./user.controller"
// import lib
import isEmpty from "../lib/isEmpty"
import { IncCntObjId } from "../lib/generalFun"
import { encryptString, decryptString } from "../lib/cryptoJS"
import UserToken from "../models/userToken"
import { checkToken } from "../lib/recaptcha"

const ObjectId = mongoose.Types.ObjectId

/**
 * Create New User
 * URL: /api/register
 * METHOD : POST
 * BODY : email, password, confirmPassword, referalcode, langCode, role, reCaptcha
 */

export const createNewUser = async (req, res) => {
  try {
    let reqBody = req.body
    // let recaptcha = await checkToken(reqBody.reCaptcha);
    if (reqBody.roleType == 2) {
      let checkMobile = await User.findOne({
        phoneNo: reqBody.newPhoneNo,
        phoneCode: reqBody.newPhoneCode,
      })
      let smsOtp = Math.floor(100000 + Math.random() * 900000)
      if (checkMobile) {
        if (!checkMobile.adminApproval) {
          return res.status(400).json({
            success: false,
            message: "Your account still not activated yet",
            errors: { newPhoneNo: "Phone Number already exists" },
          })
        }
        if (checkMobile.adminApproval) {
          return res.status(400).json({
            success: false,
            message: "Phone Number already exists",
            errors: { newPhoneNo: "Phone Number already exists" },
          })
        }
      }
      if (checkMobile == null) {
        let newUser = new User({
          password: reqBody.password,
          phoneCode: reqBody.newPhoneCode,
          phoneNo: reqBody.newPhoneNo,
          invitationCode: !isEmpty(reqBody.inviteCode)
            ? reqBody.inviteCode
            : "",
          // referralCode: referralcode,
        })

        newUser.userId = IncCntObjId(newUser._id)
        let newDoc = await newUser.save()
        let encryptToken = encryptString(newDoc._id)
        defaultUserSetting(newDoc)
        return res.status(200).json({
          status: true,
          message: "Request sent to admin successfully",
          userToken: encryptToken,
          verficationType: "register",
          isMobile: true,
        })
      }
    }
  } catch (err) {
    console.log("-----err", err)
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" })
  }
}
function getSeqNo(userLength, adminLength, adminData) {
  const adminSeqNo = adminData[userLength % adminLength].seqNo ?? -1
  return adminSeqNo
}
export const registerRequest = async (req, res) => {
  try {
    let reqBody = req.body
   /*  let recaptcha = await checkToken(reqBody.reCaptcha)

    if (recaptcha && recaptcha.status == false) {
      return res
        .status(500)
        .json({ success: false, message: "Invalid reCaptcha" })
    }
 */
    let checkRefUsr
    let checkMobile = await User.findOne({
      phoneNo: reqBody.phoneNo,
      phoneCode: reqBody.countryCode,
    })
    if (checkMobile) {
      if (!checkMobile.adminApproval) {
        return res.status(400).json({
          success: false,
          message: "Your account still not activated yet",
          errors: { newPhoneNo: "Phone Number already exists" },
        })
      }
      if (checkMobile.adminApproval) {
        return res.status(400).json({
          success: false,
          message: "Phone Number already exists",
          // errors: { newPhoneNo: "Phone Number already exists" },
        })
      }
    }
    if (!isEmpty(reqBody.inviteCode)) {
      checkRefUsr = await User.findOne({
        invitationCode: reqBody.inviteCode,
      })
      if (isEmpty(checkRefUsr))
        return res.status(400).json({
          message: "Invalid Referral code",
          success: false,
          errors: { inviteCode: "Invalid referral code" },
        })
    } else if (isEmpty(reqBody.inviteCode)) {
      return res.status(400).json({
        message: "",
        success: false,
        errors: { inviteCode: "Referral code required" },
      })
    }
    if (checkMobile == null) {
      let inviteCode = couponCode.generate()

      let newUser = new User({
        adminSeqNo: checkRefUsr.adminSeqNo,
        password: reqBody.password,
        phoneCode: reqBody.countryCode,
        phoneNo: reqBody.phoneNo,
        userName: reqBody.username,
        invitationCode: inviteCode,
        referrer: checkRefUsr._id,
      })

      newUser.userId = IncCntObjId(newUser._id)

      let newDoc = await newUser.save()
      let encryptToken = encryptString(newDoc._id)
      defaultUserSetting(newDoc)

      checkRefUsr.refCount += 1
      checkRefUsr.childIds.push(newUser._id)
      await checkRefUsr.save()

      return res.status(200).json({
        status: true,
        message:
          "Your Registration is done successfully, Waiting for the Activation",
        userToken: encryptToken,
        verficationType: "register",
        isMobile: true,
      })
    }
  } catch (err) {
    console.log("-----err", err)
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" })
  }
}

export const defaultUserSetting = async (userData) => {
  if (!isEmpty(userData)) {
    try {
      let newSetting = new UserSetting({
        userId: userData._id,
      })

      let languageData = await Language.findOne({ isPrimary: true })
      if (languageData) {
        newSetting.languageId = languageData._id
      }

      await newSetting.save()
    } catch (err) {
      console.log("-----err", err)
    }
  }
}

export const userLogin = async (req, res) => {
  try {
    let reqBody = req.body
    console.log(reqBody, "<<< --- LOGIN REQBODY --- >>>")
    let checkUser
    checkUser = await User.findOne({
      phoneNo: reqBody.phoneNo,
      phoneCode: reqBody.countryCode,
    })

    if (!checkUser) {
      return res.status(400).json({
        success: false,
        message: "Phone Number not exists",
      })
    }

    // if (!isEmpty(checkUser)) {
    //   if (checkUser.userLocked == "true") {
    //     return res
    //       .status(400)
    //       .json({ success: false, message: "your account is still locked" });
    //   }
    // }

    if (!checkUser.adminApproval) {
      return res.status(400).json({
        success: false,
        message:
          "Account Frozen. Please await administrator approval before further action.",
      })
    }

    if (!checkUser.authenticate(reqBody.password)) {
      if (!checkUser.isBlock) {
        let update = {
          login_attempt:
            checkUser.login_attempt == 4 ? 0 : checkUser.login_attempt + 1,
          isBlock: checkUser.login_attempt == 4 ? true : false,
          lock_session: checkUser.login_attempt == 4 ? new Date() : new Date(),
        }
        await User.updateMany({ _id: checkUser._id }, update, { new: true })
      }

      return res.status(400).json({
        success: false,
        errors: { password: "Password incorrect" },
      })
    }

    /* MOBILE OTP */
    let encryptToken = encryptString(checkUser._id, true)
    let tokenId = ObjectId()
    let payloadData = {
      _id: checkUser._id,
      uniqueId: checkUser.userId,
      ipAddress: reqBody?.loginHistory?.ipaddress,
      tokenId: tokenId,
      role: "user",
    }
    console.log("payloadData: ", payloadData)
    let token = new User().generateJWT(payloadData)

    let reqData = {
      id: checkUser._id,
      userCode: checkUser.userId,
      token: token,
      type: checkUser.type,
      email: checkUser.email,
      tokenId: tokenId,
      userLocked: checkUser.userLocked,
    }
    await UserToken.findOneAndUpdate(
      { userId: checkUser._id, userCode: checkUser.userId },
      { tokenId: tokenId, token: token },
      { upsert: true }
    )

    let result = await userProfileDetail(checkUser)
    let userSetting = await UserSetting.findOne({ userId: checkUser._id })
    checkUser.save()

    let update = {
      login_attempt: 0,
      isBlock: false,
    }
    await User.updateMany({ _id: checkUser._id }, update, { new: true })

    return res.status(200).json({
      status: true,
      message: "Login Success!",
      token,
      result,
      userSetting,
    })
  } catch (err) {
    console.log(err, "Error in userLogin")
    return res.status(500).json({ status: false, message: "Error on server" })
  }
}

/**
 * Reset Password
 * METHOD : POST
 * URL : /api/resetPassword
 * BODY : password, confirmPassword, authToken
 */
export const resetPassword = async (req, res) => {
  try {
    let reqBody = req.body,
      otpTime = new Date(new Date().getTime() - 120000) //2 min

    let userId = await decryptString(reqBody.authToken, true)
    let userData = await User.findOne({ _id: userId })

    if (!userData) {
      return res.status(500).json({ success: false, message: "NOT FOUND" })
    }

    if (!(userData.conFirmMailToken == reqBody.authToken)) {
      return res
        .status(400)
        .json({ success: false, message: "Your link was expiry" })
    }

    // if (userData.otptime <= otpTime) {
    //   userData.conFirmMailToken = "";
    //   await userData.save();
    //   return res.status(400).json({
    //     success: false,
    //     message: "your link was expired, only valid for 2 Minutes",
    //   });
    // }
    if (userData.authenticate(reqBody.password)) {
      return res.status(400).json({
        success: false,
        message: "Password already used please enter new password",
      })
    }
    userData.password = reqBody.password
    userData.conFirmMailToken = ""
    await userData.save()

    return res
      .status(200)
      .json({ success: true, message: "Reset password updated successfully" })
  } catch (err) {
    console.log("authTokenauthTokenauthTokenauthToken", err)
    return res.status(500).json({ success: false, message: "SOMETHING WRONG" })
  }
}

/**
 * Email Verification
 * METHOD : POST
 * URL : /api/confirm-mail
 * BODY : userId
 */
export const confirmMail = async (req, res) => {
  try {
    let reqBody = req.body
    let userId = decryptString(reqBody.userId, true)

    let userData = await User.findOne({ _id: userId })
    if (userData.status == "unverified") {
      if (!userData) {
        return res
          .status(400)
          .json({ success: false, message: "No user found" })
      }
      userData.status = "verified"
      userData.emailStatus = "verified"
      userData.percentage += 25
      var savedata = await userData.save()

      console.log(savedata.percentage, "percentage")
      await ReferTable.findOneAndUpdate(
        { refer_child: userId },
        {
          $set: {
            status: "active",
          },
        }
      )
      return res.status(200).json({
        success: true,
        message: "Your email has been verified, you can now log in",
      })
    }
    return res.status(400).json({
      success: false,
      status: "failed",
      message: "Your link was expired",
    })
  } catch (err) {
    console.log("-----err", err)
    return res.status(500).json({ success: false, message: "Error on server" })
  }
}

const loginHistory = ({
  countryName,
  countryCode,
  ipaddress,
  region, // regionName
  broswername,
  ismobile,
  os,
  status,
  reason,
  userId,
}) => {
  // let data = {
  //     countryName,
  //     countryCode,
  //     ipaddress,
  //     regionName: region,
  //     broswername,
  //     ismobile,
  //     os,
  //     status,
  //     reason,
  // };

  // User.update(
  //     { _id: userId },
  //     {
  //         $push: {
  //             loginhistory: data,
  //         },
  //     },
  //     (err, data) => { }
  // );

  const Data = new LoginHistory({
    countryName: countryName,
    countryCode: countryCode,
    ipaddress: ipaddress,
    regionName: region, // regionName
    broswername: broswername,
    ismobile: ismobile,
    os: os,
    status: status,
    reason: reason,
    userId: userId,
    adminId: userId,
  })
  const saveData = Data.save()
}

// const userProfileDetail = (userData) => {
//   let data = {
//     userId: userData.userId,
//     firstName: userData.firstName,
//     lastName: userData.lastName,
//     email: userData.email,
//     blockNo: userData.blockNo,
//     address: userData.address,
//     city: userData.city,
//     state: userData.state,
//     country: userData.country,
//     postalCode: userData.postalCode,
//     emailStatus: userData.emailStatus,
//     phoneStatus: userData.phoneStatus,
//     phoneCode: userData.phoneCode,
//     phoneNo: userData.phoneNo,
//     type: userData.type,
//     twoFAStatus: !isEmpty(userData.google2Fa.secret) ? "enabled" : "disabled",
//     createAt: moment(userData.createAt).format("DD MMM YYYY"),
//     loginHistory:
//       userData.loginhistory && userData.loginhistory.slice(-1).length > 0
//         ? userData.loginhistory.slice(-1)[0]
//         : {},
//     bankDetail: {},
//     antiphishingcode: userData.antiphishingcode,
//   };

//   if (userData.bankDetails && userData.bankDetails.length > 0) {
//     let bankDetail = userData.bankDetails.find((el) => el.isPrimary == true);
//     if (bankDetail) {
//       data.bankDetail["bankName"] = bankDetail.bankName;
//       data.bankDetail["accountNo"] = bankDetail.accountNo;
//       data.bankDetail["holderName"] = bankDetail.holderName;
//       data.bankDetail["bankcode"] = bankDetail.bankcode;
//       data.bankDetail["country"] = bankDetail.country;
//       data.bankDetail["city"] = bankDetail.city;
//     }
//   }

//   return data;
// };

export const fetchUser = async (reqBody) => {
  try {
    const data = await User.findOne({ _id: reqBody.id }, {})

    let result = {
      _id: data._id,
      userCode: data.userId,
      google2Fa: {
        secret: data.google2Fa.secret,
        uri: data.google2Fa.uri,
      },
      email: data.email,
      phoneNo: data.phoneNo,
      createdAt: data.createdAt,
      profileImage: data.profileImage,
    }

    return { status: true, ...result }
  } catch (err) {
    console.log(err)
  }
}

export const fetchAdmin = async (reqBody) => {
  try {
    const data = await Admin.findOne(
      { _id: reqBody.id },
      { role: 1, google2Fa: 1 }
    )
    if (!data) {
      return { isAuth: false }
    }
    return {
      isAuth: true,
      _id: data._id,
      role: data.role,
      google2Fa: {
        secret: data.google2Fa.secret,
        uri: data.google2Fa.uri,
      },
    }
  } catch {
    return { isAuth: false }
  }
}

export const getBankDetails = async (reqBody) => {
  try {
    const data = await User.findOne(
      { _id: reqBody.id },
      { bankDetails: 1, google2Fa: 1 }
    )
    if (!data) {
      return { status: false }
    }
    const result = {
      _id: data._id,
      bankDetails: data.bankDetails,
      google2Fa: data.google2Fa.secret,
    }
    return { status: true, ...result }
  } catch {
    return { status: false }
  }
}
export const forgotPasswordReq = async (req, res) => {
  try {
    let reqBody = req.body

    return res.status(200).json({
      success: true,
      message: "Your email has been verified, you can now log in",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error on server" })
  }
}
