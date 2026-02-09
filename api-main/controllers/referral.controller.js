// import package
import mongoose from "mongoose";
import { generateSecret, verifyToken } from "node-2fa";
import moment from "moment";
import csv from "csv-express";
const ObjectId = mongoose.Types.ObjectId;
// import modal
import { referralFeeDetail, ReferTable, ReferralReward } from "../models";
import {
  paginationQuery,
  filterSearchQuery,
  columnFillter,
} from "../lib/adminHelpers";
import isEmpty from "../lib/isEmpty";

/**
 * Get Referal Reward History
 * URL : /api/notificationHistory
 * METHOD : GET
 */
export const getReferralRewardHistory = async (req, res) => {
  try {
    let pagination = paginationQuery(req.query);
    let filer = {}
    let reqBody = req.query
    if (!isEmpty(reqBody.email)) {
      filer["email"] = new RegExp(
        reqBody.email,
        "i"
      );
    }
    if (!isEmpty(reqBody.amount)) {
      filer["amount"] = parseFloat(reqBody.amount)
    }

    if (!isEmpty(reqBody.rewardCurrency)) {
      if (reqBody.rewardCurrency != "all") {
        filer["rewardCurrency"] = reqBody.rewardCurrency
      }

    }

    let count = await ReferralReward.aggregate(
      [
        {
          $match: {
            userId: ObjectId(req.user.id)
          }
        },
        {
          $lookup: {
            from: "user",
            localField: "refer_child",
            foreignField: "_id",
            as: "referchild",
          },
        },
        { $unwind: "$referchild" },
        {
          $project: {
            "tradeId": 1,
            "userId": 1,
            "parentCode": 1,
            "refer_child": 1,
            "child_Code": 1,
            "amount": 1,
            "rewardCurrency": 1,
            "createdAt": 1,
            "email": "$referchild.email",
            "phoneCode": "$referchild.phoneCode",
            "phoneNo": "$referchild.phoneNo",

          },
        },
        {
          $match: filer
        }
      ])


    ReferralReward.aggregate(
      [
        {
          $match: {
            userId: ObjectId(req.user.id)
          }
        },
        {
          $lookup: {
            from: "user",
            localField: "refer_child",
            foreignField: "_id",
            as: "referchild",
          },
        },
        { $unwind: "$referchild" },
        {
          $project: {
            "tradeId": 1,
            "userId": 1,
            "parentCode": 1,
            "refer_child": 1,
            "child_Code": 1,
            "amount": 1,
            "rewardCurrency": 1,
            "createdAt": 1,
            "email": "$referchild.email",
            "phoneCode": "$referchild.phoneCode",
            "phoneNo": "$referchild.phoneNo",

          },
        },
        {
          $match: filer
        },
        { $sort: { _id: -1 } },
        { $skip: pagination.skip },
        { $limit: pagination.limit },
      ])

      .exec((err, data) => {

        if (err) {
          return res
            .status(500)
            .json({ success: false, message: "SOMETHING_WRONG" });
        }
        return res
          .status(200)
          .json({ success: true, result: data, count: count.length });
      });

    // ReferralReward.find(filer)
    //   .populate([
    //     { path: "refer_child", select: { email: 1, phoneCode: 1, phoneNo: 1 } },
    //   ])
    //   .sort({ createdAt: -1 })
    //   .limit(pagination.limit)
    //   .skip(pagination.skip)
    //   .exec((err, data) => {
    //     if (err) {
    //       return res
    //         .status(500)
    //         .json({ success: false, message: "SOMETHING_WRONG" });
    //     }
    //     return res
    //       .status(200)
    //       .json({ success: true, result: data, count: count });
    //   });
  } catch (err) {
    ; console.log("erferrraaaaaaaaa", err);
    return res.status(500).json({ success: false, message: "SOMETHING_WRONG" });
  }
};

/**
 * Get Referal  History
 * URL : /api/notificationHistory
 * METHOD : GET
 */
export const getReferralHisotry = async (req, res) => {
  try {
    let pagination = paginationQuery(req.query);

    let filer = {}, count = [];
    let reqBody = req.query
    filer["status"] = "verified"
    if (!isEmpty(reqBody.email)) {
      filer["email"] = new RegExp(
        reqBody.email,
        "i"
      );
    }
    filer["userId"] = ObjectId(req.user.id)
    count = await ReferTable.aggregate([
      {
        $lookup: {
          from: "user",
          localField: "refer_child",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          userId: 1,
          refer_child: 1,
          parentCode: 1,
          amount: 1,
          rewardStatus: 1,
          createdAt: 1,
          status: "$userInfo.status", email: "$userInfo.email", phoneCode: "$userInfo.phoneCode",
          phoneNo: "$userInfo.phoneNo"
        },
      },
      { $match: filer },
    ])

    await ReferTable.aggregate([
      {
        $lookup: {
          from: "user",
          localField: "refer_child",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          userId: 1,
          refer_child: 1,
          parentCode: 1,
          amount: 1,
          rewardStatus: 1,
          createdAt: 1,
          status: "$userInfo.status", email: "$userInfo.email", phoneCode: "$userInfo.phoneCode",
          phoneNo: "$userInfo.phoneNo"
        },
      },
      { $match: filer },
      { $skip: pagination.skip },
      { $limit: pagination.limit },
    ])
      .exec((err, data) => {

        if (err) {
          return res
            .status(500)
            .json({ success: false, message: "SOMETHING_WRONG" });
        }
        return res.status(200).json({ success: true, result: data, count: count.length });
      });
  } catch (err) {
    console.log("refer_childrefer_childrefer_child", err);
    return res.status(500).json({ success: false, message: "SOMETHING_WRONG" });
  }
};

/**
 * Get Referal  History
 * URL : /api/notificationHistory
 * METHOD : GET
 */
export const getReferralDetails = async (req, res) => {
  try {
    let count = await ReferTable.countDocuments({
      userId: req.user.id,
      status: "active",
    });
    let referralFee = await referralFeeDetail.findOne({});
    let allReward=await ReferralReward.find({userId: ObjectId(req.user.id)})
    ReferTable.aggregate([
      {
        $match: {
          userId: ObjectId(req.user.id),
          ust_value: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          ust_value: { $sum: "$ust_value" },
        },
      },
    ]).exec((err, data) => {
      console.log("refer_childrefer_childrefer_child", data);
      if (err) {
        console.log("refer_childrefer_childrefer_child", err);
        return res
          .status(500)
          .json({ success: false, message: "SOMETHING_WRONG" });
      }
      return res.status(200).json({ success: true, ust_value: data, count, referralFee: referralFee,allReward:allReward });
    });
  } catch (err) {
    console.log("refer_childrefer_childrefer_child", err);
    return res.status(500).json({ success: false, message: "SOMETHING_WRONG" });
  }
};

/**
 * Get Referal  History
 * URL : /api/notificationHistory
 * METHOD : GET
 */
export const updateReferralAmount = async (reqBody) => {
  try {
    let updateRwedeerall = await ReferTable.findOneAndUpdate(
      {
        _id: reqBody._id,
      },
      {
        $set: {
          ust_value: reqBody.ust_value,
          amount: parseFloat(reqBody.amount),
          currency: reqBody.currency,
          rewardStatus: true,
          rewardCurrency: reqBody.rewardCurrency
        },
      }
    )
    if (updateRwedeerall) {
      return { status: true };
    } else {
      return { status: false };
    }


  } catch (err) {
    console.log("refer_childrefer_childrefer_child", err);
    return { status: false };
  }
};
