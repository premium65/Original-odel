// import packages
import mongoose from "mongoose";
// import models
import { ReferTable, SiteSetting, Transaction, User } from "../models";

const ObjectId = mongoose.Types.ObjectId;
const getMonthCommission = async () => {
  const currentDate = new Date();
  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );
  let totalMonthCommission = await User.aggregate([
    {
      $match: {
        adminApproval: true,
        createdAt: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      },
    },
    {
      $lookup: {
        from: "wallet",
        localField: "_id",
        foreignField: "_id",
        as: "walletData",
      },
    },
    {
      $unwind: "$walletData",
    },
    {
      $group: {
        _id: null,
        totalCommission: { $sum: "$walletData.totalCommission" },
      },
    },
  ]);
    if (totalMonthCommission.length > 0) {
      return totalMonthCommission[0].totalCommission;
    }
    return 0;
};
const getMonthDeposit = async () => {
  const currentDate = new Date();
  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );
  let totalMonthlyDeposit = await User.aggregate([
    {
      $match: {
        adminApproval: true,
        createdAt: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      },
    },
    {
      $lookup: {
        from: "transactions",
        localField: "_id",
        foreignField: "userId",
        as: "depositData",
      },
    },
    {
      $unwind: "$depositData",
    },
    {
      $match: {
        "depositData.type": "deposit",
      },
    },
    {
      $group: {
        _id: "$depositData.type",
        totalDeposit: { $sum: "$depositData.amount" },
        // totalCommission: { $sum: "$walletData.totalCommission" },
      },
    },
  ]);
  if (totalMonthlyDeposit.length > 0) {
    return totalMonthlyDeposit[0].totalDeposit;
  }
  return 0;
  // console.log("totalMonthlyDeposittotalMonthlyDeposit", totalMonthlyDeposit);
};
const getYearlyCommission = async () => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);

  let totalYearlyCommission = await User.aggregate([
    {
      $match: {
        adminApproval: true,
        createdAt: {
          $gte: startOfYear,
          $lte: endOfYear,
        },
      },
    },
    {
      $lookup: {
        from: "wallet",
        localField: "_id",
        foreignField: "_id",
        as: "walletData",
      },
    },
    {
      $unwind: "$walletData",
    },
    {
      $group: {
        _id: null,
        totalCommission: { $sum: "$walletData.totalCommission" },
      },
    },
  ]);
  if (totalYearlyCommission.length > 0) {
    return totalYearlyCommission[0].totalCommission;
  }
  return 0;
};
const getYearlyDeposit = async () => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);

  let totalYearlyDeposit = await User.aggregate([
    {
      $match: {
        adminApproval: true,
        createdAt: {
          $gte: startOfYear,
          $lte: endOfYear,
        },
      },
    },
    {
      $lookup: {
        from: "transactions",
        localField: "_id",
        foreignField: "userId",
        as: "depositData",
      },
    },
    {
      $unwind: "$depositData",
    },
    {
      $match: {
        "depositData.type": "deposit",
      },
    },
    {
      $group: {
        _id: "$depositData.type",
        totalDeposit: { $sum: "$depositData.amount" },
        // totalCommission: { $sum: "$walletData.totalCommission" },
      },
    },
  ]);
  if (totalYearlyDeposit.length > 0) {
    return totalYearlyDeposit[0].totalDeposit;
  }
  return 0;
  // console.log("totalMonthlyDeposittotalMonthlyDeposit", totalMonthlyDeposit);
};
// getMonthDeposit();
export const getDashboardData = async (req,res) => {
  try {
    let totalApprovedUser = await User.countDocuments({ adminApproval: true });
    let totalUnapprovedUser = await User.countDocuments({
      adminApproval: false,
    });
    let totalDeposit = await Transaction.countDocuments({ type: "deposit" });
    let totalCompletedWithdraw = await Transaction.countDocuments({
      type: "withdraw",
      status: "completed",
    });
    let totalPendingWithdraw = await Transaction.countDocuments({
      type: "withdraw",
      status: "pending",
    });
    let totalCommission = await User.aggregate([
      {
        $match: {
          adminApproval: true,
        },
      },
      {
        $lookup: {
          from: "wallet",
          localField: "_id",
          foreignField: "_id",
          as: "walletData",
        },
      },
      {
        $unwind:"$walletData"
      },
      {
        $group: {
          _id: null,
          totalCommission: { $sum: "$walletData.totalCommission" },
        },
      },
    ]);
    let totalMonthlyDeposit = await getMonthDeposit();
    let totalYearlyDeposit = await getYearlyDeposit();
    let totalMonthCommission = await getMonthCommission();
    let totalYearlyCommission = await getYearlyCommission();
    let yearlyProfit = totalYearlyDeposit - totalYearlyCommission;
    let monthlyProfit = totalMonthlyDeposit - totalMonthCommission;
    // console.log("UNAPPROVED", totalUnapprovedUser);
    // console.log("APPROVED", totalApprovedUser);
    // console.log("TOTAL_DEPOSIT", totalDeposit);
    // console.log("COMPLETED_WITHDRAW", totalCompletedWithdraw);
    // console.log("PENDING_WITHDRAW", totalPendingWithdraw);
    // console.log("TOTAL_COMMISSION", totalCommission);
    let result = {
      data: {
        totalUnapprovedUser,
        totalApprovedUser,
        totalDeposit,
        totalCompletedWithdraw,
        totalCommission:totalCommission.length > 0 ? totalCommission[0].totalCommission : 0,
        totalPendingWithdraw,
        yearlyProfit,
        monthlyProfit
      },
    };
    console.log(result.data)
    return res.status(200).json({
      success: true,
      message: "fetched successfully",
      result,
    });
  } catch (error) {
    console.log("ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
