// import package
import mongoose from "mongoose";

// import modal
import {
  Admin,
  LoginHistory,
  User,
  Currency,
  SupportTicket,
  SpotTrade,
  PriceConversion,
  Passbook,
  Modules,
  Submodules,
  UserKyc,
  referralFeeDetail,
  KycHistory,
  AdminProfit,
  ReferralReward,
  SliderManage,
  Booking,
  Package,
  DepositHistory,
  Transaction,
  PremiumTask,
  ReviewContext,
  AdminLogs,
  WithdrawReq,
  Bonus,
} from "../models";
// import cofig
import config from "../config";

// import lib
import { comparePassword, generatePassword } from "../lib/bcrypt";
import {
  paginationQuery,
  columnFillter,
  ChartFilter,
} from "../lib/adminHelpers";
import isEmpty from "../lib/isEmpty";
import { encryptString, decryptString } from "../lib/cryptoJS";

import { generateTwoFa } from "./user.controller";
import { verifyToken } from "node-2fa";
import { momentFormat } from "../lib/dateTimeHelper";
import Referencetable from "../models/Referencetable";
import "csv-express";
import Wallet from "../models/wallet";
import { IncCntObjId } from "../lib/generalFun";
import { createBookingHistory } from "./package.controller";
import { createPassbook } from "./common.controller";
import couponCode from "coupon-code";

// import isEmpty from "is-empty";
const ObjectId = mongoose.Types.ObjectId;

/**
 * Admin Login
 * URL : /adminapi/login
 * METHOD: POST
 * BODY : email, password
 */
export const adminLogin = async (req, res) => {
  try {
    let reqBody = req.body;
    reqBody.email = reqBody.email.toLowerCase();

    let checkUser = await Admin.findOne({ email: reqBody.email });
    if (!checkUser) {
      return res
        .status(404)
        .json({ success: false, errors: { email: "Email not found" } });
    }
    let { passwordStatus } = await comparePassword(
      reqBody.password,
      checkUser.password
    );
    if (!passwordStatus) {
      return res
        .status(400)
        .json({ success: false, errors: { password: "Password incorrect" } });
    }

    if (
      checkUser.google2Fa.secret &&
      checkUser.google2Fa.uri &&
      isEmpty(reqBody.twoFACode)
    ) {
      return res.json({
        success: false,
        message: "Need 2FA OTP code",
        twoFA: true,
      });
    }

    if (
      checkUser.google2Fa.secret &&
      checkUser.google2Fa.uri &&
      !isEmpty(reqBody.twoFACode)
    ) {
      let check2Fa = verifyToken(checkUser.google2Fa.secret, reqBody.twoFACode);
      // if (!(check2Fa && check2Fa.delta == 0)) {
      //     return res.status(400).json({
      //         success: false,
      //         errors: { twoFACode: "Invalid 2FA code" },
      //     });
      // }

      if (!(check2Fa && check2Fa.delta == 0)) {
        console.log("TWO_FATWO_FATWO_FA", check2Fa);
        if (check2Fa == null)
          return res.status(400).json({
            success: false,
            errors: { twoFACode: "Invalid 2FA code" },
          });
        if (check2Fa && check2Fa.delta == -1) {
          return res.status(400).json({
            success: false,
            errors: { twoFACode: "Expired 2FA Code" },
          });
        }
      }
    }

    adminLoginHistory({
      ...reqBody.loginHistory,
      ...{ status: "Success", reason: "", adminId: checkUser._id },
    });
    let payloadData = {
      _id: checkUser._id,
      restriction: checkUser.restriction,
      role: checkUser.role,
    };
    let token = new Admin().generateJWT(payloadData);
    let result = {};
    if (checkUser.role != "superadmin") {
      // var logindata = await Role.findOne({ role: checkUser.role });
      // console.log(logindata,'logindatalogindata')
      result = {
        role: checkUser.role,
        restriction: checkUser.restriction,
      };
    }
    if (checkUser.role == "superadmin") {
      result = {
        role: "superadmin",
        restriction: [],
      };
    }

    return res
      .status(200)
      .json({ success: true, message: "Login successfully", token, result });
  } catch (err) {
    console.log(err, "errror");
    return res.status(500).json({ success: false, message: "Error on server" });
  }
};

export const getAdmindata = async (req, res) => {
  try {
    let data = await Admin.find({ _id: req.user.id });
    let result = {};
    if (data[0].role != "superadmin") {
      // var logindata = await Admin.findOne({ _id: req.user.id });

      let subsModules = await Submodules.find({ status: "active" }).distinct(
        "subModule"
      );
      let modules = await Modules.find({ status: "active" }).distinct(
        "pagename"
      );

      let filteredRestrict = data[0].restriction.filter(
        (el) => subsModules.includes(el) || modules.includes(el)
      );

      result = {
        role: data[0].role,
        restriction: filteredRestrict,
      };
    }
    if (data[0].role == "superadmin") {
      result = {
        role: "superadmin",
        restriction: [],
      };
    }

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.log(err, "errror");
    return res.status(500).json({ success: false, message: "Error on server" });
  }
};

const adminLoginHistory = ({
  countryName,
  countryCode,
  ipaddress,
  region, // regionName
  broswername,
  ismobile,
  os,
  status,
  reason,
  adminId,
}) => {
  try {
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
      adminId: adminId,
      loginType: "admin",
    });
    const saveData = Data.save();
  } catch (err) {
    console.log(err, "ee178888");
  }
};

export const getUnRegUsers = async (req, res) => {
  try {
    let pagination = paginationQuery(req.query);
    let filter = columnFillter(req.query, req.headers.timezone);
    const seqNo = req.user.seqNo == 0 ? {} : { adminSeqNo: req.user.seqNo }; 
    console.log("seq", req.user.seqNo);
    let count = await User.countDocuments({ adminApproval: false, ...seqNo });
    let data = await User.find(
      { ...filter, adminApproval: false, ...seqNo },
      { _id: 1, createdAt: 1, userName:1, phoneNo: 1, referrer: 1, userId: 1 }
    )
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("referrer", "userName");

    if (!data) {
      return res.status(200).json({
        success: true,
        message: "There is no data",
        result: { data: [], count: 0 },
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "",
        result: { data, count },
      });
    }
  } catch (err) {
    console.log("-----err", err);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};
export const getUserAsset = async (req, res) => {
  try {
    let reqBody = req.query;
    console.log("REQBODY", reqBody);
    let assetData = await Wallet.findOne({ _id: ObjectId(reqBody.userId) });

    if (!assetData) {
      return res.status(200).json({
        success: true,
        message: "There is no data",
        result: { data: [], count: 0 },
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "",
        result: { data: assetData },
      });
    }
  } catch (err) {
    console.log("-----err", err);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const updateUserTaskcount = async (req, res) => {
  try {
    let { body } = req;
    if (isEmpty(body.taskCount)) {
      return res.status(400).json({
        success: false,
        error: "Please enter task count",
      });
    }
    if (parseInt(body.taskCount) > 29 || parseInt(body.taskCount) < 1) {
      return res.status(400).json({
        success: false,
        error: "Task count cannot be more than 29 or less than 1",
      });
    }

    const userData = await User.findByIdAndUpdate(body.userId, {
      $set: { taskCount: body.taskCount },
    });
    const adminLogs = new AdminLogs({
      adminEmail: req.user.email,
      adminUserId: req.user.id,
      taskType: "USER_TASK_UPDATE",
      userId: body.userId,
      userCode: userData.userId,
      taskDescription: `user's task count before: ${userData.taskCount} after: ${body.taskCount}`,
    });

    await adminLogs.save();
    return res.status(200).json({
      success: true,
      message: "Task count modified successfully.",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const resetUserTask = async (req, res) => {
  try {
    const userData = await User.findByIdAndUpdate(req.body.userId, {
      $set: { taskCount: 0 },
    });
    const adminLogs = new AdminLogs({
      adminEmail: req.user.email,
      adminUserId: req.user.id,
      taskType: "USER_TASK_RESET",
      userId: req.body.userId,
      userCode: userData.userId,
      taskDescription: `User : user's task count has been reset to zero`,
    });

    await adminLogs.save();
    return res.json({ success: true, message: "Task reset successful" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const updateUserAsset = async (req, res) => {
  try {
    let reqBody = req.body;

    let walletDoc = await Wallet.findOne({ _id: ObjectId(reqBody.userId) });

    if (reqBody.type == "reduce") {
      let obj = { totalBalance: -reqBody.amount };

      let updateData = await Wallet.updateOne(
        {
          _id: ObjectId(reqBody.userId),
          totalBalance: { $gte: parseFloat(reqBody.amount) },
        },
        { $inc: obj }
      );
      if (updateData.modifiedCount == 0) {
        //  createPassbook({
        //    type: "REDUCTION_FAILED",
        //    amount: reqBody.amount,
        //    beforeBalance: walletDoc.totalBalance,
        //    afterBalance:
        //      parseFloat(walletDoc.totalBalance) + parseFloat(reqBody.amount),
        //    category: "credit",
        //    tableId: "",
        //    userId: reqBody.userId,
        //    userCodeId: IncCntObjId(reqBody.userId),
        //    pendingBalanceBefore: walletDoc.pendingAmount,
        //    pendingBalanceAfter: walletDoc.pendingAmount,
        //    todayCommissionAfter: walletData.todayCommission,
        //    todayCommissionBefore: walletData.todayCommission,
        //  });
        return res.status(400).json({
          success: false,
          message: "Cannot reduce balance less than zero",
        });
      } else if (updateData.modifiedCount != 0) {
        createPassbook({
          type: "REDUCE_BALANCE_FROM_USER",
          amount: reqBody.amount,
          beforeBalance: walletDoc.totalBalance,
          afterBalance:
            parseFloat(walletDoc.totalBalance) - parseFloat(reqBody.amount),
          category: "debit",
          tableId: "",
          userId: reqBody.userId,
          userCodeId: IncCntObjId(reqBody.userId),
          pendingBalanceBefore: walletDoc.pendingAmount,
          pendingBalanceAfter: walletDoc.pendingAmount,
          todayCommissionAfter: walletDoc.todayCommission,
          todayCommissionBefore: walletDoc.todayCommission,
        });
      }
      const adminLogs = new AdminLogs({
        adminEmail: req.user.email,
        adminUserId: req.user.id,
        taskType: "USER_ASSET_REDUCTION",
        userId: reqBody.userId,
        userCode: updateData.userCode,
        taskDescription: `user's pending balance before: ${
          walletDoc.totalBalance
        } after: ${walletDoc.totalBalance - reqBody.amount}`,
      });

      await adminLogs.save();
      return res.status(200).json({
        success: true,
        message: "Updated Successfully",
      });
    }
    let walletObj = {};
    let setWall = {};

    if (
      parseFloat(walletDoc.pendingAmount) != 0 &&
      walletDoc.totalBalance < 0
    ) {
      if (
        Math.abs(parseFloat(walletDoc.totalBalance)) -
          parseFloat(reqBody.amount) <=
        0
      ) {
        createPassbook({
          type: "USER_WALLET_UPDATE",
          amount:
            Math.abs(
              Math.abs(parseFloat(walletDoc.totalBalance)) -
                parseFloat(reqBody.amount)
            ) == 0
              ? parseFloat(walletDoc.pendingAmount) -
                Math.abs(parseFloat(walletDoc.totalBalance))
              : parseFloat(walletDoc.pendingAmount) +
                Math.abs(
                  Math.abs(parseFloat(walletDoc.totalBalance)) -
                    parseFloat(reqBody.amount)
                ) -
                Math.abs(parseFloat(walletDoc.totalBalance)),
          beforeBalance: walletDoc.totalBalance,
          afterBalance:
            Math.abs(
              Math.abs(parseFloat(walletDoc.totalBalance)) -
                parseFloat(reqBody.amount)
            ) == 0
              ? walletDoc.pendingAmount
              : parseFloat(walletDoc.pendingAmount) +
                Math.abs(
                  Math.abs(parseFloat(walletDoc.totalBalance)) -
                    parseFloat(reqBody.amount)
                ),
          category: "credit",
          tableId: "",
          userId: reqBody.userId,
          userCodeId: IncCntObjId(reqBody.userId),
          pendingBalanceBefore: walletDoc.pendingAmount,
          pendingBalanceAfter: 0,
          todayCommissionBefore: walletDoc.todayCommission,
          todayCommissionAfter: walletDoc.todayCommission,
        });
        setWall = {
          totalBalance:
            Math.abs(
              Math.abs(parseFloat(walletDoc.totalBalance)) -
                parseFloat(reqBody.amount)
            ) == 0
              ? walletDoc.pendingAmount
              : parseFloat(walletDoc.pendingAmount) +
                Math.abs(
                  Math.abs(parseFloat(walletDoc.totalBalance)) -
                    parseFloat(reqBody.amount)
                ),
          pendingAmount: 0,
        };
      } else {
        createPassbook({
          type: "USER_ASSET_UPDATE",
          amount: reqBody.amount,
          beforeBalance: walletDoc.totalBalance,
          afterBalance:
            parseFloat(walletDoc.totalBalance) + parseFloat(reqBody.amount),
          category: "credit",
          tableId: "",
          userId: reqBody.userId,
          userCodeId: IncCntObjId(reqBody.userId),
          pendingBalanceBefore: walletDoc.pendingAmount,
          pendingBalanceAfter:
            parseFloat(walletDoc.pendingAmount) - parseFloat(reqBody.amount),
          todayCommissionAfter: walletDoc.todayCommission,
          todayCommissionBefore: walletDoc.todayCommission,
        });
        walletObj = {
          pendingAmount: -parseFloat(reqBody.amount),
          totalBalance: parseFloat(reqBody.amount),
        };
      }
    } else if (parseFloat(walletDoc.pendingAmount) != 0) {
      if (
        parseFloat(walletDoc.pendingAmount) - parseFloat(reqBody.amount) <=
        0
      ) {
        createPassbook({
          type: "USER_ASSET_UPDATE",
          amount: reqBody.amount,
          beforeBalance: walletDoc.totalBalance,
          afterBalance:
            parseFloat(walletDoc.totalBalance) + parseFloat(reqBody.amount),
          category: "credit",
          tableId: "",
          userId: reqBody.userId,
          userCodeId: IncCntObjId(reqBody.userId),
          pendingBalanceBefore: walletDoc.pendingAmount,
          pendingBalanceAfter: 0,
          todayCommissionAfter: walletDoc.todayCommission,
          todayCommissionBefore: walletDoc.todayCommission,
        });
        setWall = {
          pendingAmount: 0,
        };
        walletObj = {
          totalBalance: parseFloat(reqBody.amount),
        };
      } else {
        createPassbook({
          type: "USER_ASSET_UPDATE",
          amount: reqBody.amount,
          beforeBalance: walletDoc.totalBalance,
          afterBalance:
            parseFloat(walletDoc.totalBalance) + parseFloat(reqBody.amount),
          category: "credit",
          tableId: "",
          userId: reqBody.userId,
          userCodeId: IncCntObjId(reqBody.userId),
          pendingBalanceBefore: walletDoc.pendingAmount,
          pendingBalanceAfter:
            parseFloat(walletDoc.pendingAmount) - parseFloat(reqBody.amount),
          todayCommissionAfter: walletDoc.todayCommission,
          todayCommissionBefore: walletDoc.todayCommission,
        });
        walletObj = {
          totalBalance: parseFloat(reqBody.amount),
          pendingAmount: -parseFloat(reqBody.amount),
        };
      }
    } else {
      createPassbook({
        type: "USER_ASSET_UPDATE",
        amount: reqBody.amount,
        beforeBalance: walletDoc.totalBalance,
        afterBalance:
          parseFloat(walletDoc.totalBalance) + parseFloat(reqBody.amount),
        category: "credit",
        tableId: "",
        userId: reqBody.userId,
        userCodeId: IncCntObjId(reqBody.userId),
        pendingBalanceBefore: walletDoc.pendingAmount,
        pendingBalanceAfter: parseFloat(walletDoc.pendingAmount),
        todayCommissionAfter: walletDoc.todayCommission,
        todayCommissionBefore: walletDoc.todayCommission,
      });
      walletObj = {
        totalBalance: parseFloat(reqBody.amount),
      };
    }

    console.log("SET_WALL", setWall);
    console.log("WALL_OBJ", walletObj);
    // return;
    const walletData = await Wallet.findOneAndUpdate(
      {
        _id: ObjectId(reqBody.userId),
      },
      {
        $set: {
          ...setWall,
        },
        $inc: {
          ...walletObj,
          totalDeposit: reqBody.amount,
        },
      }
    );
    const adminLogs = new AdminLogs({
      adminEmail: req.user.email,
      adminUserId: req.user.id,
      taskType: "USER_ASSET_UPDATE",
      userId: reqBody.userId,
      userCode: walletData.userCode,
      taskDescription: `user's pending balance before: ${
        walletData.totalBalance
      } after: ${walletData.totalBalance - reqBody.amount}`,
    });

    await adminLogs.save();
    const transaction = new Transaction({
      type: "deposit",
      userId: reqBody.userId,
      amount: reqBody.amount,
      status: "completed",
    });
    await transaction.save();
    return res.status(200).json({
      success: true,
      message: "Updated Successfully",
    });
  } catch (err) {
    console.log("-----err", err);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const updateUserPassword = async (req, res) => {
  try {
    const { body } = req;
    let passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{6,18}/g;
    if (!passwordRegex.test(body.password)) {
      return res.status(400).json({
        success: false,
        errors: {
          password:
            "Password should contain atleast one uppercase, lowercase, symbol and number with 6 to 18 characters in length",
        },
      });
    }

    if (body.password !== body.confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords didn't match",
        errors: {
          password: "Passwords didn't match",
          confirmPassword: "Passwords didn't match",
        },
      });
    }

    let user = await User.findById(body.userId);

    user.password = body.password;
    await user.save();
    const adminLogs = new AdminLogs({
      adminEmail: req.user.email,
      adminUserId: req.user.id,
      taskType: "USER_PASSWORD_CHANGED",
      userId: user._id,
      userCode: user.userId,
      taskDescription: `password has changed for this user`,
    });

    await adminLogs.save();
    return res.json({ success: true, message: "Password updated" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const approveRegistration = async (req, res) => {
  try {
    let { userId } = req.body;
    let data = await User.findOne({ _id: userId });
    let bookingData = await Booking.find({}, { _id: 1 });

    if (data.adminApproval) {
      return res.status(200).json({
        success: true,
        message: "Already approved",
      });
    } else {
      if (bookingData.length > 0) {
        bookingData = bookingData.map((booking) => ({
          // ...booking,
          _id: booking._id,
          count: 0,
          // status: "new",
        }));

        data.bookings = [...bookingData];
      }
      data.adminApproval = true;
      data.badge = "trial";

      const wallet = new Wallet({
        _id: ObjectId(userId),
        userCode: IncCntObjId(userId),
        level: "trial",
        levelBonus: 10000,
        totalBalance: 10000,
        totalCommission: 0,
        todayCommission: 0,
        pendingAmount: 0,
      });
      await wallet.save();
      await data.save();

      const adminLogs = new AdminLogs({
        adminEmail: req.user.email,
        adminUserId: req.user.id,
        taskType: "USER_REGISTRATION_APPROVED",
        userId: data._id,
        userCode: data.userId,
        taskDescription: `user's registration request approved`,
      });

      await adminLogs.save();
      createPassbook({
        type: "TRIAL_BONUS_RECEIVED",
        amount: 10000,
        beforeBalance: 0,
        afterBalance: 10000,
        category: "credit",
        tableId: "",
        userId: userId,
        userCodeId: IncCntObjId(userId),
        pendingBalanceBefore: 0,
        pendingBalanceAfter: 0,
        todayCommissionBefore: 0,
        todayCommissionAfter: 0,
      });

      createBookingHistory({
        type: "TRIAL_REWARD",
        field: "totalBalance",
        balBefore: 0,
        amount: 10000,
        balAfter: 10000,
        userId: userId,
      });
      return res.status(200).json({
        success: true,
        message: "Approved Successfully",
      });
    }
  } catch (err) {
    console.log("-----err", err);
    return res
      .status(500)

      .json({ success: false, message: "Something went wrong" });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    let adminId = req.user.id;
    const adminDetail = await Admin.findOne({ _id: adminId });
    res.status(200).json({ success: true, result: adminDetail });
  } catch (err) {}
};

export const updateProfile = async (req, res) => {
  try {
    let reqBody = req.body;
    reqBody.email = reqBody.email.toLowerCase();
    let checkAdmin = await Admin.findOne({ _id: req.user.id });
    let checkemail = await Admin.findOne({
      email: reqBody.email,
      _id: { $ne: req.user.id },
    });
    let checkPhone = await Admin.findOne({
      phoneNumber: req.body.phoneNumber,
      _id: { $ne: req.user.id },
    });

    if (checkemail) {
      return res
        .status(400)
        .json({ success: false, errors: { email: "email already exist" } });
    }
    if (checkPhone) {
      return res.status(400).json({
        success: false,
        errors: { phoneNumber: "mobile number already exist" },
      });
    }

    checkAdmin.email = reqBody.email;
    checkAdmin.phoneNumber = reqBody.phoneNumber;
    checkAdmin.name = reqBody.name;
    checkAdmin.save();
    return res
      .status(200)
      .json({ success: true, message: "Profile Updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "error on server" });
  }
};

export const changePassword = async (req, res) => {
  try {
    let reqBody = req.body;
    let adminData = await Admin.findOne({ _id: req.user.id });
    if (!adminData) {
      return res
        .status(500)
        .json({ success: false, errors: { message: "User not found" } });
    }
    let { passwordStatus } = await comparePassword(
      reqBody.oldPassword,
      adminData.password
    );
    if (!passwordStatus) {
      return res.status(400).json({
        success: false,
        errors: { oldPassword: "Password incorrect" },
      });
    }
    let { hash } = await generatePassword(reqBody.newPassword);

    adminData.password = hash;
    await adminData.save();
    return res
      .status(200)
      .json({ success: true, message: "Password Changed successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error on server" });
  }
};

/**
 * Reset Password
 * METHOD : POST
 * URL : /api/admin/modules
 * BODY : pagename, status
 */
export const addModules = async (req, res) => {
  let reqBody = req.body;
  try {
    let checkUser = await Modules.findOne({ pagename: reqBody.pagename });
    if (!isEmpty(checkUser)) {
      return res.status(400).json({
        success: false,
        error: { pagename: "Module name already exists" },
      });
    }
    let newData = new Modules({
      pagename: reqBody.pagename,
      status: reqBody.status,
    });
    let Data = await newData.save();
    if (isEmpty(Data)) {
      return res.status(400).json({ success: false, message: "Failed" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Added successfully" });
  } catch (err) {
    console.log(err, "error");
    return res
      .status(500)
      .json({ staus: false, message: "something went wrong" });
  }
};

export const getmodules = async (req, res) => {
  try {
    let pagination = paginationQuery(req.query);
    let count = await Modules.countDocuments();
    let filter = columnFillter(req.query, req.headers.timezone);
    let data = await Modules.find(filter, {})
      .sort({ _id: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);
    let result = {
      data,
      count,
    };
    return res.status(200).json({ success: true, result });
  } catch (err) {
    return res
      .status(500)
      .json({ success: true, message: "Something went wrong" });
  }
};

export const updateModules = async (req, res) => {
  try {
    let reqBody = req.body;
    let checkData = await Modules.findOne({ _id: reqBody.id });
    if (!checkData) {
      return res
        .status(400)
        .json({ success: false, message: "There is no category" });
    }
    await Modules.updateOne(
      { _id: reqBody.id },
      { $set: { pagename: reqBody.pagename, status: reqBody.status } }
    );
    return res
      .status(200)
      .json({ success: true, message: "Updated successfully " });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const deletemodule = async (req, res) => {
  try {
    let checkDoc = await Modules.findOne({ _id: req.body.id });
    if (!checkDoc) {
      return res
        .status(400)
        .json({ success: false, message: "There is no record" });
    }
    await checkDoc.remove();
    return res
      .status(200)
      .json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const getsingelmodules = async (req, res) => {
  Modules.findOne({ _id: req.params.id }, (err, data) => {
    if (err) {
      return res
        .status(400)
        .json({ success: false, message: "Error on server" });
    }
    return res.status(200).json({ success: true, result: data });
  });
};

export const modules = async (req, res) => {
  try {
    let data = await Modules.find({ status: "active" });
    return res.status(200).json({ success: true, result: data });
  } catch (err) {
    return res
      .status(500)
      .json({ success: true, message: "Something went wrong" });
  }
};

/**
 * Add New Admin
 * URL : /adminapi/admin
 * METHOD: POST
 * BODY : name, email, password ,restriction(path, isWriteAccess)
 */

export const createAdmin = async (req, res) => {
  let reqBody = req.body;
  try {
    let checkUser = await Admin.findOne({ email: reqBody.email });
    let adminCheck = await Admin.findOne({ _id: req.user.id });
    if (adminCheck.role === "admin") {
      return res.status(400).json({ status: false, message: "Access Denied" });
    }
    if (!isEmpty(checkUser)) {
      return res
        .status(400)
        .json({ success: false, error: { email: "Email Not Exists" } });
    }
    let { passwordStatus, hash } = await generatePassword(reqBody.password);
    if (!passwordStatus) {
      return res
        .status(500)
        .json({ success: false, error: { messages: "Error on server" } });
    }
    const latestAdminData = await Admin.findOne(
      { role: "subadmin" },
      { seqNo: 1 }
    ).sort({
      createdAt: -1,
    });

    let inviteCode = couponCode.generate();

    let newAdmin = new Admin({
      seqNo: latestAdminData ? latestAdminData.seqNo + 1 : 1,
      name: reqBody.name,
      email: reqBody.email,
      password: hash,
      role: reqBody.role,
      adminInviteId: inviteCode,
    });
    await newAdmin.save();

    let newUser = new User({
      adminSeqNo: latestAdminData ? latestAdminData.seqNo + 1 : 1,
      password: reqBody.password,
      phoneCode: 0,
      phoneNo: 0,
      invitationCode: inviteCode,
      userName: reqBody.name,
      role: "subadmin",
      adminApproval: true,
    });
    newUser.userId = IncCntObjId(newUser._id);
    await newUser.save();

    return res
      .status(200)
      .json({ success: true, message: "Admin created successfully" });
  } catch (err) {
    console.log(err, "err");
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};
export const deleteAdmin = async (req, res) => {
  try {
    let reqBody = req.body;
    const adminCount = await Admin.countDocuments({ role: "subadmin" });
    const adminData = await Admin.findOne({ _id: reqBody.id }, { seqNo: 1 });
    const updateData = await Admin.findOneAndDelete(
      { _id: reqBody.id },
      { seqNo: 1 }
    );

    console.log(adminData, "updateDataupdateDataupdateData");

    const newAdmin = await Admin.findOne(
      {
        role: "subadmin",
        $or: [{ seqNo: adminData.seqNo + 1 }, { seqNo: adminData.seqNo - 1 }],
      },
      {
        seqNo: 1,
      }
    );
    await User.updateMany(
      { adminSeqNo: adminData.seqNo },
      {
        $set: {
          adminSeqNo: newAdmin.seqNo,
        },
      }
    );
    await Bonus.updateMany(
      { adminSeqNo: adminData.seqNo },
      {
        $set: {
          adminSeqNo: newAdmin.seqNo,
        },
      }
    );
    await Transaction.updateMany(
      { adminSeqNo: adminData.seqNo },
      {
        $set: {
          adminSeqNo: newAdmin.seqNo,
        },
      }
    );
    await WithdrawReq.updateMany(
      { adminSeqNo: adminData.seqNo },
      {
        $set: {
          adminSeqNo: newAdmin.seqNo,
        },
      }
    );

    if (!newAdmin) {
      return res
        .status(400)
        .json({ success: false, message: "Something went wrong" });
    }

    if (adminCount == 1) {
      return res
        .status(400)
        .json({
          success: false,
          message: "you are not allowed to delete this",
        });
    }
    if (!isEmpty(updateData)) {
      return res
        .status(200)
        .json({ success: true, message: "Deleted Successfully" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "There is no data" });
    }
  } catch (err) {
    console.log(err, "error");
    return res
      .status(500)
      .json({ success: false, errors: { messages: "Error on server" } });
  }
};

export const getadmin = async (req, res) => {
  try {
    let pagination = paginationQuery(req.query);
    let filter = columnFillter(req.query, req.headers.timezone);
    filter["role"] = { $in: ["admin", "subadmin"] };
    let count = await Admin.countDocuments(filter);
    let data = await Admin.find(filter)
      .sort({ _id: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);

    let result = {
      data,
      count,
    };

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.log(err, "error");
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const getsingleadmin = async (req, res) => {
  try {
    let Data = await Admin.findOne({ _id: req.params.id });
    return res
      .status(200)
      .json({ success: true, message: "FETCH_SUCCESS", result: Data });
  } catch (err) {}
};

export const getpath = async (req, res) => {
  try {
    let Data = await Admin.find({ _id: req.user.id });

    return res.status(200).json({
      success: true,
      message: "FETCH_SUCCESS",
      result: Data[0].restriction,
    });
  } catch (err) {
    console.log(err, "errpr");
  }
};

/**
 * Edit Admin
 * URL : /adminapi/admin
 * METHOD: POST
 * BODY : adminId, name, email, restriction(path, isWriteAccess)
 */
export const editadmin = async (req, res) => {
  try {
    let reqBody = req.body;
    let getPath = reqBody.restriction;

    reqBody.email = reqBody.email.toLowerCase();
    let checkUser = await Admin.findOne({ _id: reqBody.id });
    let checkAdmin = await Admin.findOne({ _id: req.user.id });

    if (!checkUser) {
      return res
        .status(400)
        .json({ success: false, error: { email: "Email is not exists" } });
    }
    if (checkAdmin.role === "admin") {
      return res
        .status(400)
        .json({ status: false, message: "Super Admin Only update" });
    }
    console.log(getPath, "getPath");
    let updateData = await Admin.findOneAndUpdate(
      { _id: reqBody.id },
      {
        $set: {
          name: reqBody.name,
          email: reqBody.email,
          restriction: getPath,
        },
      },
      { new: true }
    );

    console.log(updateData, "updateDataupdateDataupdateData");
    if (!isEmpty(updateData)) {
      return res
        .status(200)
        .json({ success: true, message: "Updated Successfully" });
    } else {
      return res.status(400).json({ status: false, message: "Update failed" });
    }
  } catch (err) {
    console.log(err, "error");
    return res
      .status(500)
      .json({ success: false, errors: { messages: "Error on server" } });
  }
};

//  Get LoginHistory
//  URL : /adminapi/profile
//  METHOD: GET

export const LoginhistoryPag = async (req, res) => {
  try {
    console.log("test");
    let pagination = paginationQuery(req.query);
    let filter = columnFillter(req.query, req.headers.timezone);
    filter["adminId"] = ObjectId(req.user.id);
    let Export = req.query.export;
    const header = [
      "Create Date",
      "country Code",
      "country Name",
      "Ipaddress",
      "Device",
    ];
    if (Export == "csv" || Export == "xls") {
      let exportData = await LoginHistory.find(filter, {
        _id: 0,
        countryCode: 1,
        countryName: 1,
        regionName: 1,
        ipaddress: 1,
        broswername: 1,
        ismobile: 1,
        os: 1,
        status: 1,
        reason: 1,
        createdDate: 1,
        // createdDate: {
        //     $dateToString: {
        //         date: "$createdDate",
        //         format: "%d-%m-%Y %H:%M",
        //         timezone: req.headers.timezone,
        //     }
        // },
      }).sort({ _id: -1 });
      let csvData = [header];

      if (exportData && exportData.length > 0) {
        for (let item of exportData) {
          let arr = [];
          arr.push(
            momentFormat(String(item.createdDate), "YYYY-MM-DD HH:mm"),
            item.countryCode,
            item.countryName,
            item.ipaddress,
            item.os
          );
          csvData.push(arr);
        }
      }
      return res.csv(csvData);
    } else if (Export == "pdf") {
      let count = await LoginHistory.countDocuments(filter);
      let data = await LoginHistory.find(filter, {
        _id: 0,
        countryCode: 1,
        countryName: 1,
        regionName: 1,
        ipaddress: 1,
        broswername: 1,
        ismobile: 1,
        os: 1,
        status: 1,
        reason: 1,
        createdDate: 1,
      }).sort({ _id: -1 });
      // .skip(pagination.skip).limit(pagination.limit)
      let result = {
        count,
        pdfData: data,
      };
      return res
        .status(200)
        .json({ success: true, message: "FETCH_SUCCESS", result: result });
    } else {
      let count = await LoginHistory.countDocuments(filter);
      const data = await LoginHistory.aggregate([
        { $match: filter },
        { $sort: { _id: -1 } },
        { $skip: pagination.skip },
        { $limit: pagination.limit },
        {
          $project: {
            _id: 0,
            countryCode: 1,
            countryName: 1,
            regionName: 1,
            ipaddress: 1,
            broswername: 1,
            ismobile: 1,
            os: 1,
            status: 1,
            reason: 1,
            createdDate: 1,
          },
        },
      ]);
      let result = {
        count,
        data,
        //  imageUrl: `${config.SERVER_URL}${config.IMAGE.CURRENCY_URL_PATH}`
      };

      return res.status(200).json({ success: true, result });
    }
  } catch (err) {
    console.log(err, "eeeeeeeeeeee");
    return res.status(500).json({ success: false, message: "Error on Server" });
  }
};

export const submodules = async (req, res) => {
  try {
    let data = await Submodules.find({});
    return res.status(200).json({ success: true, result: data });
  } catch {
    return res
      .status(500)
      .json({ success: true, message: "Something went wrong" });
  }
};

export const getRole = async (req, res) => {
  try {
    let pagination = paginationQuery(req.query);
    let count = await Role.countDocuments();
    let filter = columnFillter(req.query, req.headers.timezone);
    let data = await Role.find(filter, {})
      .skip(pagination.skip)
      .limit(pagination.limit);

    let result = {
      data,
      count,
    };
    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.log(err, "error");
    return res
      .status(500)
      .json({ success: true, message: "Something went wrong" });
  }
};

export const addRole = async (req, res) => {
  let reqBody = req.body;
  try {
    let getPath = reqBody.restriction;
    let checkUser = await Role.findOne({ role: reqBody.role });
    if (!isEmpty(checkUser)) {
      return res
        .status(400)
        .json({ success: false, error: { role: "Email is not exists" } });
    }
    let newData = new Role({
      role: reqBody.role,
      restriction: getPath,
    });
    let Data = await newData.save();
    if (isEmpty(Data)) {
      return res.status(400).json({ success: false, message: "Failed" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Added successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ staus: false, message: "Something went wrong" });
  }
};

export const updateRole = async (req, res) => {
  let reqBody = req.body;
  try {
    console.log("REQBODY", reqBody);
    let getPath = reqBody.restriction;
    let maindata = await Submodules.find({
      subModule: { $in: reqBody.restriction },
    });
    console.log("MAIN", maindata);
    for (let i = 0; i < maindata.length; i++) {
      let data = maindata[i].mainmoduleId;
      console.log("DATA", data);
      let datas = await Modules.findOne({ _id: data });
      console.log("DATAS", datas);
      getPath.push(datas.pagename);
    }
    let updateData = await Admin.findOneAndUpdate(
      { _id: reqBody.id },
      {
        $set: {
          restriction: getPath,
          // role: reqBody.role,
        },
      },
      { new: true }
    );
    if (isEmpty(updateData)) {
      return res.status(400).json({ status: false, message: "Update failed" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Updated Successfully" });
  } catch (err) {
    console.log("ERROR", err);
    return res
      .status(500)
      .json({ success: false, errors: { messages: "Error on server" } });
  }
};

export const getSingleRole = async (req, res) => {
  try {
    let Data = await Admin.findOne({ _id: req.params.id });
    let result = {
      restriction: Data.restriction,
      role: Data.role,
    };
    return res
      .status(200)
      .json({ success: true, message: "FETCH_SUCCESS", result });
  } catch (err) {}
};

export const getrole = async (req, res) => {
  try {
    let data = await Role.find({});
    return res.status(200).json({ success: true, result: data });
  } catch (err) {
    return res
      .status(500)
      .json({ success: true, message: "Something went wrong" });
  }
};

export const addSubModule = async (req, res) => {
  let reqBody = req.body;
  try {
    let checkUser = await Submodules.findOne({ subModule: reqBody.subModule });
    let mainModuleCheck = await Modules.findOne({
      _id: ObjectId(reqBody.mainmodule),
    });

    if (/dashboard/i.test(mainModuleCheck.pagename)) {
      return res.status(400).json({
        success: false,
        error: { mainmodule: "Cannot add Dashboard as submodules" },
      });
    }

    if (!mainModuleCheck || isEmpty(mainModuleCheck)) {
      return res.status(400).json({
        success: false,
        error: { mainmodule: "Mainmodule does not Exist" },
      });
    }

    if (!isEmpty(checkUser)) {
      return res
        .status(400)
        .json({ success: false, error: { subModule: "SubModule Exists" } });
    }
    let newData = new Submodules({
      mainmoduleId: reqBody.mainmodule,
      subModule: reqBody.subModule,
      status: reqBody.status,
    });
    let Data = await newData.save();
    if (!isEmpty(Data)) {
      return res
        .status(200)
        .json({ success: true, message: "Added successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Failed" });
    }
  } catch (err) {
    console.log(err, "error");
    return res
      .status(500)
      .json({ staus: false, message: "something went wrong" });
  }
};
//New
export const getsubmodules = async (req, res) => {
  try {
    let data, count;

    if (req.query.page && req.query.limit) {
      // Apply pagination and filter only when page and limit are present
      const pagination = paginationQuery(req.query);
      const filter = columnFillter(req.query, req.headers.timezone);

      count = await Submodules.countDocuments(filter);
      data = await Submodules.find(filter)
        .sort({ _id: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit);
    } else {
      // If page and limit are not present, fetch all data without filter
      count = await Submodules.countDocuments();
      data = await Submodules.find().sort({ _id: -1 });
    }

    const result = {
      data,
      count,
    };

    return res.status(200).json({ success: true, result });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

/* export const getsubmodules = async (req, res) => {
  try {
    let pagination = paginationQuery(req.query);
    let count = await Submodules.countDocuments();
    let filter = columnFillter(req.query, req.headers.timezone);
    let data = await Submodules.find(filter, {})
      .sort({ _id: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);
      let result = {
        data,
        count,
      };
      return res.status(200).json({ success: true, result });
  } catch {
    return res
      .status(500)
      .json({ success: true, message: "Something went wrong" });
  }
}; */

export const updateSubModules = async (req, res) => {
  let reqBody = req.body;
  try {
    let checkData = await Submodules.findOne({ _id: reqBody.id });
    if (!checkData) {
      return res
        .status(400)
        .json({ success: false, message: "There Is No Category" });
    }
    await Submodules.updateOne(
      { _id: reqBody.id },
      {
        $set: {
          mainmoduleId: reqBody.mainmodule,
          subModule: reqBody.subModule,
          status: reqBody.status,
        },
      }
    );
    return res
      .status(200)
      .json({ success: true, message: "Updated successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const deletesubmodule = async (req, res) => {
  try {
    let checkDoc = await Submodules.findOne({ _id: req.body.id });
    if (!checkDoc) {
      return res
        .status(400)
        .json({ success: false, message: "There Is No Record" });
    }
    await checkDoc.remove();
    return res
      .status(200)
      .json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const getsinglesubmodule = async (req, res) => {
  Submodules.findOne({ _id: req.params.id }, (err, data) => {
    if (err) {
      return res
        .status(400)
        .json({ success: false, message: "Error on server" });
    }
    return res.status(200).json({ success: true, result: data });
  });
};

export const get2FAStatus = async (req, res) => {
  try {
    let adminUser = await Admin.findOne({ _id: req.user.id });

    if (adminUser.google2Fa.secret && adminUser.google2Fa.uri) {
      return res.json({ status: true, subStatus: true });
    } else {
      return res.json({ status: true, subStatus: false });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Error on server" });
  }
};

export const get2faCode = async (req, res) => {
  try {
    let adminUser = await Admin.findOne({ _id: req.user.id });
    let result = generateTwoFa(adminUser);

    return res.status(200).json({ success: true, result: result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Error on server" });
  }
};

export const update2faCode = async (req, res) => {
  try {
    let reqBody = req.body;
    console.log("reqBody: ", reqBody);
    let userData = await Admin.findOne({ _id: req.user.id });
    // if (!userData.authenticate(reqBody.Password)) {
    //   return res
    //     .status(400)
    //     .json({ success: false, errors: { Password: "Password incorrect" } });
    // }
    let check2Fa = verifyToken(reqBody.secret, reqBody.code);
    console.log("check2Fa: ", check2Fa);
    if (check2Fa && check2Fa.delta == 0) {
      let updateData = await Admin.findOneAndUpdate(
        { _id: req.user.id },
        {
          "google2Fa.secret": reqBody.secret,
          "google2Fa.uri": reqBody.uri,
        },
        { new: true }
      );
      let result = generateTwoFa(updateData);
      // let doc = {
      //   userId: req.user.id,
      //   title: "2FA",
      //   description: "Your 2FA has been enabled",
      // };
      // newNotification(doc);
      return res
        .status(200)
        .json({ success: true, message: "2FA Enabled Successfully", result });
    }

    return res
      .status(400)
      .json({ success: false, errors: { code: "Invalid Code" } });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Error on server" });
  }
};

export const get2FAData = async (req, res) => {
  try {
    let adminData = await Admin.findOne({ _id: req.user.id });

    let result = {
      uri: adminData.google2Fa.uri,
      secret: adminData.google2Fa.secret,
    };

    return res.json({ ...result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Error on server" });
  }
};

export const diabled2faCode = async (req, res) => {
  try {
    let reqBody = req.body;
    //   if (reqBody.CheckValue == false) {
    //     return res.status(400).json({
    //       success: false,
    //       errors: { CheckValue: "Please select backupcode" },
    //     });
    //   }
    let userData = await Admin.findOne({ _id: req.user.id });
    // if (!userData.authenticate(reqBody.Password)) {
    //   return res
    //     .status(400)
    //     .json({ success: false, errors: { Password: "Password incorrect" } });
    // }
    if (userData.google2Fa && userData.google2Fa.secret != reqBody.secret) {
      return res
        .status(500)
        .json({ success: false, message: "SOMETHING_WRONG" });
    }
    let check2Fa = verifyToken(reqBody.secret, reqBody.code);
    if (check2Fa && check2Fa.delta == 0) {
      userData.google2Fa.secret = "";
      userData.google2Fa.uri = "";
      let updateData = await userData.save();
      let result = generateTwoFa(updateData);
      // let doc = {
      //   userId: req.user.id,
      //   title: "2FA",
      //   description: " Your 2FA has been disabled",
      // };
      // newNotification(doc);
      return res
        .status(200)
        .json({ success: true, message: "2FA Disabled Successfully", result });
    }

    return res
      .status(400)
      .json({ success: false, errors: { code: "Invalid Code" } });
  } catch (err) {
    return res.status(500).json({ success: false, message: "something wrong" });
  }
};

export const forgetPassword = async (req, res) => {
  try {
    let reqBody = req.body;

    // if (recaptcha && recaptcha.status == false) {
    //     return res.status(500).json({ success: false, message: "Invalid reCaptcha" });
    // }
    let userData = await Admin.findOne({ email: reqBody.email });
    if (!userData) {
      return res
        .status(400)
        .json({ success: false, errors: { email: "Email does not exist" } });
    }

    let encryptToken = await encryptString(userData._id, true);
    // let content = {
    //   name: userData.name,
    //   confirmMailUrl: `${config.FRONT_URL}/verification/forgotPassword?auth=${encryptToken}`,
    // };

    userData.mailToken = encryptToken;
    userData.otptime = new Date();

    await userData.save();

    return res.status(200).json({
      success: true,
      message: "Reset password link sent to registered mail ID",
    });
  } catch (err) {
    console.log("-----err", err);
    return res.status(500).json({ success: false, message: "SOMETHING WRONG" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    let reqBody = req.body,
      otpTime = new Date(new Date().getTime() - 120000); //2 min

    let userId = await decryptString(reqBody.authToken, true);
    let userData = await Admin.findOne({ _id: userId });

    if (!userData) {
      return res.status(500).json({ success: false, message: "NOT FOUND" });
    }

    if (!(userData.mailToken == reqBody.authToken)) {
      return res
        .status(400)
        .json({ success: false, message: "Your link was expiry" });
    }

    // if (userData.otptime <= otpTime) {
    //   userData.conFirmMailToken = "";
    //   await userData.save();
    //   return res.status(400).json({
    //     success: false,
    //     message: "your link was expired, only valid for 2 Minutes",
    //   });
    // }
    let comparison = await comparePassword(reqBody.password, userData.password);
    if (comparison.passwordStatus) {
      return res.status(400).json({
        success: false,
        message: "Password already used please enter new password",
      });
    }
    let pass = generatePassword(reqBody.password);
    userData.password = pass.hash;
    userData.mailToken = "";
    await userData.save();

    return res
      .status(200)
      .json({ success: true, message: "Reset password updated successfully" });
  } catch (err) {
    console.log("authTokenauthTokenauthTokenauthToken", err);
    return res.status(500).json({ success: false, message: "SOMETHING WRONG" });
  }
};

export const getRefferalSetting = async (req, res) => {
  try {
    const setting = await referralFeeDetail.findOne({});
    if (!setting) {
      return res.json({ success: false, result: {} });
    }
    return res.json({ success: true, result: setting });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Error on server" });
  }
};

export const getReferrelList = async (req, res) => {
  try {
    let pagination = paginationQuery(req.query);
    let filter = columnFillter(req.query, req.headers.timezone);
    let Export = req.query.export;
    const header = ["Date", "Referred By", "Referred To", "Status"];
    if (Export === "xls" || Export === "csv") {
      let exportData = await Referencetable.find(filter, {}).sort({
        createdAt: -1,
      });

      let csvData = [header];
      if (exportData && exportData.length > 0) {
        for (let item of exportData) {
          let arr = [];
          arr.push(
            momentFormat(String(item.createdAt), "DD-MM-YYYY h:mm A"),
            item.parentCode,
            item.child_Code,
            item.status
          );
          csvData.push(arr);
        }
      }
      return res.csv(csvData);
    } else if (Export === "pdf") {
      let Data = await Referencetable.find(filter)
        .sort({ _id: -1 })
        .exec((err, data) => {
          if (err) {
            return res
              .status(500)
              .json({ success: false, message: "Something went wrong" });
          }
          let reqData = {
            pdfData: data,
          };
          return res
            .status(200)
            .json({ success: true, message: "FETCH", result: reqData });
        });
    } else {
      let count = await Referencetable.countDocuments(filter);
      let sortObj = await JSON.parse(req.query.sortObj);
      let sorts = isEmpty(sortObj) ? { _id: -1 } : sortObj;

      let query = [
        {
          $sort: sorts,
        },
        {
          $match: filter,
        },
        {
          $skip: pagination.skip,
        },
        {
          $limit: pagination.limit,
        },
      ];

      const data = await Referencetable.aggregate(query);

      return res.json({ success: true, result: { count, data } });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Error on server" });
  }
};

export const getRefferalBonus = async (req, res) => {
  try {
    let pagination = paginationQuery(req.query);
    let filter = columnFillter(req.query, req.headers.timezone);
    let Export = req.query.export;
    const header = [
      "Date",
      "Referred By",
      "Referred To",
      "Reward Amount",
      "Reward Currency",
    ];
    if (Export === "xls" || Export === "csv") {
      let exportData = await ReferralReward.find(filter, {}).sort({
        createdAt: -1,
      });

      let csvData = [header];
      if (exportData && exportData.length > 0) {
        for (let item of exportData) {
          let arr = [];
          arr.push(
            momentFormat(String(item.createdAt), "DD-MM-YYYY h:mm A"),
            item.parentCode,
            item.child_Code,
            item.rewardCurrency,
            item.amount
          );
          csvData.push(arr);
        }
      }
      return res.csv(csvData);
    } else if (Export === "pdf") {
      let Data = await ReferralReward.find(filter)
        .sort({ _id: -1 })
        .exec((err, data) => {
          if (err) {
            return res
              .status(500)
              .json({ success: false, message: "Something went wrong" });
          }
          let reqData = {
            pdfData: data,
          };
          return res
            .status(200)
            .json({ success: true, message: "FETCH", result: reqData });
        });
    } else {
      let count = await ReferralReward.countDocuments(filter);
      let sortObj = await JSON.parse(req.query.sortObj);
      let sorts = isEmpty(sortObj) ? { _id: -1 } : sortObj;

      const data = await ReferralReward.find(filter)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .sort(sorts);

      return res.json({ success: true, result: { count, data } });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Error on server" });
  }
};

export const forceRejectKyc = async (req, res) => {
  try {
    const reqBody = req.body;
    const kycInfo = await UserKyc.findOne({ userId: reqBody.userId });

    const userData = await User.findOne({ _id: reqBody.userId });

    if (userData && userData.percentage) {
      if (
        kycInfo.idProof.status == "approved" &&
        kycInfo.addressProof.status == "approved"
      ) {
        userData.percentage -= 30;
      }

      if (
        kycInfo.idProof.status == "approved" &&
        kycInfo.addressProof.status == "new"
      ) {
        userData.percentage -= 15;
      }
      if (
        kycInfo.idProof.status == "new" &&
        kycInfo.addressProof.status == "approved"
      ) {
        userData.percentage -= 15;
      }
    }

    if (isEmpty(reqBody.reason)) {
      return res
        .status(400)
        .json({ success: false, message: "Reason cannot be empty" });
    }
    kycInfo.idProof.status = "rejected";
    kycInfo.idProof.reason = reqBody.reason;
    kycInfo.addressProof.status = "rejected";
    kycInfo.addressProof.reason = reqBody.reason;
    kycInfo.bankProof.status = 4;
    kycInfo.bankProof.reason = reqBody.reason;
    kycInfo.selfiId.status = 4;

    await KycHistory.create({
      userId: reqBody.userId,
      oldKyc: kycInfo,
      reason: reqBody.reason,
    });
    await UserKyc.updateOne({ _id: kycInfo._id }, { $set: kycInfo });
    // await UserKyc.create({userId: reqBody.userId})
    await userData.save();
    return res.json({ success: true, message: "Rejected successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Error on server" });
  }
};

export const getRejections = async (req, res) => {
  try {
    const filter = columnFillter(req.query, req.headers.timezone);
    const pagination = paginationQuery(req.query);
    const sorts = await JSON.parse(req.query.sortObj);
    const sort = isEmpty(sorts) ? { _id: -1 } : sorts;

    const query = [
      {
        $sort: sort,
      },
      {
        $lookup: {
          from: "user",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          oldKyc: 1,
          userId: 1,
          email: "$user.email",
          createdAt: 1,
          status: 1,
          reason: 1,
        },
      },
      {
        $match: filter,
      },
      {
        $skip: pagination.skip,
      },
      {
        $limit: pagination.limit,
      },
    ];
    const query2 = [
      {
        $sort: sort,
      },
      {
        $lookup: {
          from: "user",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          oldKyc: 1,
          userId: 1,
          email: "$user.email",
          createdAt: 1,
          status: 1,
          reason: 1,
        },
      },
      {
        $match: filter,
      },
    ];

    const data = await KycHistory.aggregate(query);
    const count = await KycHistory.aggregate(query2);

    return res.json({ success: true, result: { data, count: count.length } });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Error on server" });
  }
};

export const CheckAuthToken = async (req, res) => {
  try {
    let reqBody = req.body;

    let userId = await decryptString(reqBody.authToken, true);
    let userData = await Admin.findOne({ _id: userId });

    if (!userData) {
      return res.status(500).json({ success: false, message: "NOT FOUND" });
    }

    if (!(userData.mailToken == reqBody.authToken)) {
      return res
        .status(400)
        .json({ success: false, message: "Your link was expiry" });
    }
  } catch (err) {
    console.log("Auth Token", err);
    return res.status(500).json({ success: false, message: "SOMETHING WRONG" });
  }
};

export const getAdmin2FA = async (req, res) => {
  let { google2Fa } = await Admin.findOne(
    { _id: req.user.id },
    { google2Fa: 1 }
  );
  if (google2Fa) {
    return res.status(200).json({ status: true, result: google2Fa });
  }
  return res.status(400).json({ status: false, message: "Error on server" });
};
export const getUserPremiumDetails = async (req, res) => {
  try {
    let pagination = paginationQuery(req.query);
    let filter = columnFillter(req.query, req.headers.timezone);
    const count = await PremiumTask.countDocuments();
    const seqNo = req.user.seqNo == 0 ? {} : { adminSeqNo: req.user.seqNo };

    let data = await PremiumTask.find({ ...filter })
      .populate({
        path: "userId",
        match: { ...seqNo },
      })
      .sort({ updatedAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);

    if (!data) {
      return res.status(200).json({
        success: true,
        message: "There is no data",
        result: { data: [], count: 0 },
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Fetched Successfully",
        result: { data, count },
      });
    }
  } catch (err) {
    console.log("-----err", err);
    return res
      .status(500)
      .json({ status: false, message: "Something went wrong" });
  }
};
export const getPassbookDetails = async (req, res) => {
  try {
    let pagination = paginationQuery(req.query);
    let filter = columnFillter(req.query, req.headers.timezone);
    let count = await Passbook.countDocuments();
    let data = await Passbook.find(
      { ...filter }
      // { _id: 1, createdAt: 1, phoneNo: 1, referrer: 1, userId: 1 }
    )
      .sort({ updatedAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);
    // .populate("referrer", "userId");
    if (!data) {
      return res.status(200).json({
        success: true,
        message: "There is no data",
        result: { data: [], count: 0 },
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "",
        result: { data, count },
      });
    }
  } catch (err) {
    console.log("-----err", err);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const getAllAddresses = async (req, res) => {
  try {
    let data = (await ReviewContext.find({ type: "address" }).lean()) || [];
    let count = data.length;

    return res.status(200).json({ success: true, result: { data, count } });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const getAllLandmarks = async (req, res) => {
  try {
    let data = (await ReviewContext.find({ type: "landmark" }).lean()) || [];
    let count = data.length;

    return res.status(200).json({ success: true, result: { data, count } });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const createAddresses = async (req, res) => {
  try {
    const { body } = req;

    if (isEmpty(body.address)) {
      return res
        .status(400)
        .json({ success: false, message: "Address is required" });
    }

    let docs = new ReviewContext({
      type: "address",
      value: body.address,
    });
    await docs.save();

    return res
      .status(201)
      .json({ success: true, message: "Address added successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const createLandmarks = async (req, res) => {
  try {
    const { body } = req;

    if (isEmpty(body.landmark)) {
      return res
        .status(400)
        .json({ success: false, message: "Landmark is required" });
    }

    let docs = new ReviewContext({
      type: "landmark",
      value: body.landmark,
    });
    await docs.save();

    return res
      .status(201)
      .json({ success: true, message: "Landmark added successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { params } = req;

    if (isEmpty(params.id) || params.id.length != 24) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request" });
    }

    let deletion = await ReviewContext.deleteOne({ _id: params.id }).lean();
    if (deletion.deletedCount > 0) {
      return res
        .status(201)
        .json({ success: true, message: "Succesfully deleted" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid address" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const deleteLandmarks = async (req, res) => {
  try {
    const { params } = req;

    if (isEmpty(params.id) || params.id.length != 24) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request" });
    }

    let deletion = await ReviewContext.deleteOne({ _id: params.id }).lean();
    if (deletion.deletedCount > 0) {
      return res
        .status(201)
        .json({ success: true, message: "Succesfully deleted" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid landmarks" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const getAdminLogsData = async (req, res) => {
  try {
    const seqNo = req.user.seqNo == 0 ? {} : { adminSeqNo: req.user.seqNo };

    let pagination = paginationQuery(req.query);
    let filter = columnFillter(req.query, req.headers.timezone);
    let sortObj =
      req.query?.sortObj && !isEmpty(JSON.parse(req.query.sortObj))
        ? JSON.parse(req.query.sortObj)
        : { _id: -1 };
    const { adminId } = req.query;
    const aggregator = [
      {
        $match: {
          ...filter,
          adminUserId: ObjectId(adminId),
        },
      },
      {
        $sort: sortObj,
      },
      {
        $skip: pagination.skip,
      },
      {
        $limit: pagination.limit,
      },
    ];
    console.log("filter:", filter);
    console.log("aggregator:", aggregator);

    const logData = await AdminLogs.aggregate(aggregator);

    const loginAggregator = [
      {
        $match: {
          ...filter,
          adminId: ObjectId(adminId),
        },
      },
      {
        $sort: sortObj,
      },
      {
        $skip: pagination.skip,
      },
      {
        $limit: pagination.limit,
      },
    ];
    // const logData = await AdminLogs.find({ adminUserId: adminId })
    const loginData = await LoginHistory.aggregate(loginAggregator);
    // const loginData = await LoginHistory.find({ adminId })

    return res
      .status(200)
      .json({ success: true, result: { logData, loginData } });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const getAdmins = async (req, res) => {
  try {
    const data = await Admin.find(
      { role: "subadmin" },
      {
        name: 1,
        email: 1,
        seqNo: 1,
      }
    );
    return res.status(200).json({ success: true, result: { data } });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};
