import mongoose from "mongoose"
import Wallet from "../models/wallet"
import isEmpty from "../lib/isEmpty"
import { AdminLogs, Bonus, Transaction, User, WithdrawReq } from "../models"
import { createBookingHistory } from "./package.controller"
import { columnFillter, paginationQuery } from "../lib/adminHelpers"
import { IncCntObjId } from "../lib/generalFun"

const ObjectId = mongoose.Types.ObjectId

export const getUserWallet = async (req, res) => {
  try {
    const response = await Wallet.findOne({ _id: req.user.id })

    if (response) {
      return res
        .status(200)
        .json({ success: true, result: { data: response }, message: "" })
    } else if (!response) {
      return res.status(400).json({
        success: true,
        result: {},
        message: "There is no wallet for this user",
      })
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error On Server",
    })
  }
}

export const withdrawRequest = async (req, res) => {
  let reqBody = req.body

  try {
    const walletData = await Wallet.findOne({ _id: req.user.id })
    const userData = await User.findOne({ _id: ObjectId(req.user.id) })
    if (!isEmpty(userData) && isEmpty(userData.bankDetails)) {
      return res.status(400).json({
        success: true,
        message: "Please Add Bank Detail First",
      })
    }
    if (isEmpty(walletData)) {
      return res.status(400).json({
        success: true,
        message: "There is no wallet data",
      })
    } else if (parseFloat(reqBody.amount) < 500) {
      return res.status(400).json({
        success: true,
        message: "Withdrawal amount should be more than 500",
      })
    } else if (!isEmpty(walletData) && walletData.totalBalance <= 0) {
      return res.status(400).json({
        success: true,
        message: "Your balance very low to withdraw",
      })
    } else if (parseFloat(reqBody.amount) <= 0 || reqBody.amount == "") {
      return res.status(400).json({
        success: true,
        message: "Amount must be greater than 0",
      })
    } else if (
      parseFloat(walletData.totalBalance) < parseFloat(reqBody.amount)
    ) {
      return res.status(400).json({
        success: true,
        message: "Balance is lower than the requested amount",
      })
    }
    const userReqData = await WithdrawReq.find({
      userId: req.user.id,
      rec: false,
    })
    if (userReqData.length > 0) {
      return res.status(400).json({
        success: true,
        message: "You can't make any withdraw request right now",
      })
    }
    if (userData.taskCount !== parseInt(process.env.TASK_COUNT)) {
      return res.status(400).json({
        success: true,
        message:
          "Sorry, you are in an incomplete Bookings. Please complete 30 bookings for your withdrawal.",
      })
    }
    walletData.totalBalance -= reqBody.amount
    walletData.pendingAmount += parseFloat(reqBody.amount)
    walletData.totalWithdraw += parseFloat(reqBody.amount)
    await walletData.save()

    if (
      !isEmpty(userData) &&
      !isEmpty(userData.bankDetails) &&
      userData.bankDetails.length > 0
    ) {
      let request = new WithdrawReq({
        adminSeqNo: req.user.adminSeqNo,
        userId: req.user.id,
        userCode: IncCntObjId(req.user.id),
        amount: reqBody.amount,
        bankDetails: userData.bankDetails[0],
      })
      await request.save()
      let transaction = new Transaction({
        adminSeqNo: req.user.adminSeqNo,
        type: "withdraw",
        amount: reqBody.amount,
        status: "pending",
        userId: req.user.id,
        tableId: request._id,
      })
      await transaction.save()
      return res
        .status(200)
        .json({ success: true, message: "Withdraw request sent successfully" })
    } else {
      return res.status(400).json({
        success: true,
        message: "Please Update User Bank Account",
      })
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error On Server",
    })
  }
}
export const getWithdrawRequests = async (req, res) => {
  try {
    const seqNo = req.user.seqNo == 0 ? {} : { adminSeqNo: req.user.seqNo }

    let pagination = paginationQuery(req.query)
    let query = {
      filter: JSON.stringify({ fillter: JSON.parse(req.query.fillter) }),
    }
    let filter = columnFillter(query, req.headers.timezone)
    filter = { ...filter, ...seqNo }
    let sortObj = !isEmpty(JSON.parse(req.query.sortObj))
      ? JSON.parse(req.query.sortObj)
      : { _id: -1 }

    // filter['rec'] = false

    if (filter?.userId) {
      let userIds = await User.find({
        userId: filter.userId,
        ...seqNo,
      }).distinct("_id")
      filter.userId = { $in: userIds }
    }

    if (filter?.phoneNo) {
      let userIds = await User.find({
        phoneNo: filter.phoneNo,
        ...seqNo,
      }).distinct("_id")
      if (!filter?.userId || isEmpty(filter?.userId?.$in)) {
        filter.userId = { $in: userIds }
      } else {
        filter.userId.$in = [...filter.userId.$in, ...userIds]
      }
    }

    let withdrawData = await WithdrawReq.find(filter)
      .sort(sortObj)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("userId", "userId phoneNo")
    let withdrawCount = await WithdrawReq.countDocuments()
    // let withdrawData = await WithdrawReq.aggregate(aggregator)
    if (!isEmpty(withdrawData)) {
      return res.status(200).json({
        success: true,
        result: { data: withdrawData, count: withdrawCount },
        message: "Withdraw request sent successfully",
      })
    } else {
      return res.status(400).json({
        success: true,
        result: { data: [], withdrawCount },
        message: "There is no data",
      })
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error On Server",
    })
  }
}

export const approveWithdrawRequest = async (req, res) => {
  let reqBody = req.body
  console.log("res", reqBody)
  try {
    await WithdrawReq.updateOne(
      { _id: ObjectId(reqBody.tableId) },
      {
        rec: true,
        status: "completed"
      }
    )
    const walletData = await Wallet.findOneAndUpdate(
      { _id: ObjectId(reqBody.userId.id) },
      {
        $inc: {
          pendingAmount: -reqBody.amount,
        },
      },
      {
        new: true,
      }
    )
    const adminLogs = new AdminLogs({
      adminEmail: req.user.email,
      adminUserId: req.user.id,
      taskType: "WITHDRAW_REQUEST_ACCEPTED",
      userId: reqBody.userId.id,
      userCode: walletData.userCode,
      taskDescription: `User's before pending balance: ${
        walletData.pendingAmount + reqBody.amount
      }\n after: ${walletData.pendingAmount}`,
    })

    await adminLogs.save()

    await Transaction.updateOne(
      { tableId: reqBody.tableId },
      { status: "completed" }
    )
    return res.status(200).json({
      status: "success",
      success: true,
      message: "Withdraw approved successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error On Server",
    })
  }
}

export const rejectWithdrawRequest = async (req, res) => {
  let reqBody = req.body
  try {
    console.log(reqBody)
    let updated = await WithdrawReq.updateOne(
      { userId: reqBody.userId, _id: ObjectId(reqBody.tableId) },
      {
        rec: true,
        status: "rejected",
        reason: reqBody.reason,
      }
    )

    const walletData = await Wallet.findOneAndUpdate(
      { _id: reqBody.userId },
      {
        $inc: {
          pendingAmount: -reqBody.amount,
          totalBalance: reqBody.amount,
        },
      },
      {
        new: true,
      }
    )
    await Transaction.updateOne(
      { tableId: reqBody.tableId },
      { status: "rejected", reason: reqBody.reason }
    )
    const adminLogs = new AdminLogs({
      adminEmail: req.user.email,
      adminUserId: req.user.id,
      taskType: "WITHDRAW_REQUEST_REJECTED",
      userId: reqBody.userId,
      userCode: walletData.userCode,
      taskDescription: `User's pending balance before: ${
        walletData.pendingAmount + reqBody.amount
      } after: ${walletData.pendingAmount}\n user's total balance before: ${
        walletData.totalBalance - reqBody.amount
      } after: ${walletData.totalBalance}
      `,
    })
    await adminLogs.save()
    return res.status(200).json({
      status: "success",
      success: true,
      message: "Withdraw rejected successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error On Server",
    })
  }
}

export const declineWithdrawRequest = async (req, res) => {
  try {
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" })
  }
}

export const getTransactionHistory = async (req, res) => {
  try {
    console.log(req.query.filter)
    let filter =
      req.query.filter == "."
        ? { $in: ["deposit", "withdraw"] }
        : req.query.filter

    let data = await Transaction.find({
      userId: req.user.id,
      type: filter,
    }).sort({ createdAt: -1 })
    return res
      .status(200)
      .json({ success: true, result: { data }, message: "" })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error On Server",
    })
  }
}

export const getDepositHistory = async (req, res) => {
  try {
    let { query } = req
    const seqNo = req.user.seqNo == 0 ? {} : { adminSeqNo: req.user.seqNo }

    let pagination = paginationQuery(query)
    let filter = columnFillter(query)
    let sortObj = !isEmpty(JSON.parse(req.query.sortObj))
      ? JSON.parse(req.query.sortObj)
      : { _id: -1 }

    console.log(filter)

    let userIds = filter?.userId
      ? await User.find({ userId: filter.userId, ...seqNo }).distinct("_id")
      : null
    if (userIds && !isEmpty(userIds)) filter.userId = { $in: userIds }

    console.log(filter)

    filter["type"] = "deposit"

    let data = await Transaction.aggregate([
      {
        $match: {
          ...seqNo,
        },
      },
      {
        $project: {
          amount: { $toString: "$amount" },
          userId: 1,
          createdAt: 1,
          status: 1,
          type: 1,
        },
      },
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "user",
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      {
        $unwind: "$userId",
      },
      {
        $project: {
          status: 1,
          createdAt: 1,
          userId: "$userId.userId",
          amount: 1,
        },
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
    ])

    let result = {
      count: data[0].count,
      data: data[0].data,
    }

    return res.json({ success: true, result })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" })
  }
}

export const getBonusHistoryList = async (req, res) => {
  try {
    let { query } = req
    const seqNo = req.user.seqNo == 0 ? {} : { adminSeqNo: req.user.seqNo }

    let pagination = paginationQuery(query)
    let filter = columnFillter(query)
    let sortObj = !isEmpty(JSON.parse(req.query.sortObj))
      ? JSON.parse(req.query.sortObj)
      : { _id: -1 }

    if (filter["status"]) {
      ;(filter.status = new RegExp(filter.status.$eq)), "i"
    }

    filter["$expr"] = { $and: [] }
    filter = { ...filter, ...seqNo }

    if (filter.amount) {
      filter.$expr.$and.push({
        $regexMatch: {
          input: { $toString: "$amount" },
          regex: filter.amount,
        },
      })
      delete filter["amount"]
    }

    if (filter.taskCount) {
      filter.$expr.$and.push({
        $regexMatch: {
          input: { $toString: "$taskCount" },
          regex: filter.taskCount,
        },
      })
      delete filter["taskCount"]
    }
    console.log(filter.$expr.$and)

    let data = await Bonus.find(filter)
      .sort(sortObj)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .exec()

    data = data.filter((bonus) => bonus.userId !== null)
    let count = await Bonus.countDocuments(filter)

    return res.status(200).json({ success: true, result: { data, count } })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" })
  }
}
