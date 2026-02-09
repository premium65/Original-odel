import multer from "multer"
import mongoose from "mongoose"
import config from "../config"
import imageFilter from "../lib/imageFilter"
import isEmpty from "../lib/isEmpty"
import path from "path"
import fs from "fs"
import {
  AdminLogs,
  Bonus,
  Booking,
  BookingHistory,
  PremiumTask,
} from "../models"
import { User } from "../models"
import { Wallet } from "../models"
import { Package } from "../models"
import { columnFillter, paginationQuery } from "../lib/adminHelpers"
import { commissionFeeZeroCron } from "../config/cron"
import { createPassbook } from "./common.controller"
import { IncCntObjId } from "../lib/generalFun"
import { use } from "passport"

const ObjectId = mongoose.Types.ObjectId

const landscapeStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync("public/" + file.fieldname))
      fs.mkdirSync("public/" + file.fieldname)
    cb(null, "public/" + file.fieldname)
  },

  // By default, multer removes file extensions so let's add them back
  filename: function (req, file, cb) {
    cb(null, "image-" + Date.now() + path.extname(file.originalname))
  },
})
const locationStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.IMAGE.NORMAL_PIC_PATH)
  },

  // By default, multer removes file extensions so let's add them back
  filename: function (req, file, cb) {
    cb(null, "location-" + Date.now() + path.extname(file.originalname))
  },
})
const normalStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.IMAGE.NORMAL_PIC_PATH)
  },

  // By default, multer removes file extensions so let's add them back
  filename: function (req, file, cb) {
    cb(null, "normal" + Date.now() + path.extname(file.originalname))
  },
})
let landscapeUpload = multer({
  storage: landscapeStorage,
  onError: function (err, next) {
    next(err)
  },
  fileFilter: imageFilter,
  limits: { fileSize: config.IMAGE.LANDSCAPE_IMAGE },
}).fields([
  { name: "landScapeImage", maxCount: 1 },
  { name: "locationImage", maxCount: 1 },
  { name: "hotelImages", maxCount: 6 },
])
let normalUpload = multer({
  storage: normalStorage,
  onError: function (err, next) {
    next(err)
  },
  fileFilter: imageFilter,
  limits: { fileSize: config.IMAGE.NORMAL_IMAGE },
}).fields([{ name: "hotelImages", maxCount: 6 }])
let locationImageUpload = multer({
  storage: locationStorage,
  onError: function (err, next) {
    next(err)
  },
  fileFilter: imageFilter,
  limits: { fileSize: config.IMAGE.NORMAL_IMAGE },
}).fields([{ name: "locationImage", maxCount: 1 }])
export const bookingValidation = async (req, res) => {
  try {
    let reqBody = req.body
    let reqFiles = reqFiles
    let errors = {}
    if (isEmpty(reqBody.name)) {
      errors.name = `Please enter the name field`
    }
    if (isEmpty(reqBody.type)) {
      errors.type = `Please select the type field`
    }
    if (isEmpty(reqBody.description)) {
      errors.description = `Please enter the description field`
    }
    if (isEmpty(reqBody.price)) {
      errors.price = `Please select the price field`
    }
    if (isEmpty(reqFiles.landScapeImage)) {
      errors.landScapeImage = `Please select the landScapeImage field`
    }
    if (isEmpty(reqFiles.locationImage)) {
      errors.locationImage = `Please select the locationImage field`
    }
    if (isEmpty(reqFiles.hotelImages)) {
      errors.hotelImages = `Please select the hotelImages field`
    }
    if (
      !isEmpty(reqFiles.hotelImages) &&
      (reqFiles.hotelImages.length > 6 || reqFiles.hotelImages.length < 6)
    ) {
      errors.hotelImages = "You can't add images more or less than 6"
    }
    let hotelInvalid = []
    if (!isEmpty(reqFiles.hotelImages)) {
      for (let i = 0; i < reqFiles.hotelImages.length; i++) {
        if (reqFiles.hotelImages[i].size > config.IMAGE.NORMAL_IMAGE) {
          hotelInvalid.push(reqFiles.hotelImages[i])
        }
      }
    }
    if (!isEmpty(hotelInvalid) && hotelInvalid.length > 0) {
      errors.hotelImages = `You must chose the image lower than or equal to ${config.IMAGE.LOW_SIZE} kb`
    }
    if (
      !isEmpty(reqFiles.locationImage) &&
      reqFiles.locationImage.size > config.IMAGE.LOW_SIZE
    ) {
      errors.locationImage = `You must chose the image lower than or equal to ${config.IMAGE.LOW_SIZE} kb`
    }
    if (
      !isEmpty(reqFiles.landScapeImage) &&
      reqFiles.landScapeImage.size > config.IMAGE.DEFAULT_SIZE
    ) {
      errors.landScapeImage = `You must chose the image lower than or equal to ${config.IMAGE.DEFAULT_SIZE} kb`
    }
    if (!isEmpty(errors)) {
      return res.status(400).json({ errors: errors })
    }
    return next()
  } catch (error) {}
}
export const createBookingHistory = async ({
  type,
  field,
  balBefore,
  balAfter,
  userId,
  amount,
}) => {
  let bookingHistory = new BookingHistory({
    type,
    field,
    balBefore,
    balAfter,
    userId,
    amount,
  })
  await bookingHistory.save()
}
export const uploadLandscape = (req, res, next) => {
  console.log("imageupload")
  //  file: !isEmpty(req.files && req.files.file)
  //    ? req.files.file[0].filename
  //    : req.body.filename;
  landscapeUpload(req, res, function (err) {
    console.log("REQFILE", req.file)
    console.log("REQFILESSSSSSSSSS", req.files)

    console.log("REQBODY", req.body)
    if (!isEmpty(req.validationError)) {
      return res.status(400).json({
        success: false,
        errors: {
          [req.validationError.fieldname]: req.validationError.messages,
        },
      })
    } else if (err instanceof multer.MulterError) {
      console.log("ERRROR", err)
      return res
        .status(400)
        .json({ success: false, errors: { [err.field]: "TOO_LARGE" } })
    } else if (err) {
      console.log(err)
      return res
        .status(500)
        .json({ success: false, message: "SOMETHING_WRONG" })
    }
    return next()
  })
}
export const uploadNormal = async (req, res, next) => {
  normalUpload(req, res, function (err) {
    if (!isEmpty(req.validationError)) {
      return res.status(400).json({
        success: false,
        errors: {
          [req.validationError.fieldname]: req.validationError.messages,
        },
      })
    } else if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ success: false, errors: { [err.field]: "TOO_LARGE" } })
    } else if (err) {
      console.log(err)
      return res
        .status(500)
        .json({ success: false, message: "SOMETHING_WRONG" })
    }
    return next()
  })
}
export const uploadLocation = async (req, res, next) => {
  locationImageUpload(req, res, function (err) {
    if (!isEmpty(req.validationError)) {
      return res.status(400).json({
        success: false,
        errors: {
          [req.validationError.fieldname]: req.validationError.messages,
        },
      })
    } else if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ success: false, errors: { [err.field]: "TOO_LARGE" } })
    } else if (err) {
      console.log(err)
      return res
        .status(500)
        .json({ success: false, message: "SOMETHING_WRONG" })
    }
    return next()
  })
}
// Booking
export const addBooking = async (req, res) => {
  try {
    const reqBody = req.body
    console.log("REQBODYEDIT", reqBody)
    let reqFiles = req.files
    if (reqBody.section === "edit") {
      let hotelImages
      if (!isEmpty(reqFiles.hotelImages)) {
        hotelImages = reqFiles.hotelImages.map((item) => item.filename)
      } else {
        hotelImages = reqBody.hotelImages
      }
      console.log("REQBODYEDIT", reqBody)

      await Booking.updateOne(
        { _id: reqBody._id },
        {
          // type: reqBody.type,
          name: reqBody.name,
          commissionFee: reqBody.commissionFee,
          price: parseInt(reqBody.price),
          description: reqBody.description,
          locationImage:
            !isEmpty(reqFiles) &&
            !isEmpty(reqFiles.locationImage) &&
            !isEmpty(reqFiles.locationImage[0].filename)
              ? reqFiles.locationImage[0].filename
              : reqBody.locationImage,
          landScapeImage:
            !isEmpty(reqFiles) &&
            !isEmpty(reqFiles.landScapeImage) &&
            !isEmpty(reqFiles.landScapeImage[0].filename)
              ? reqFiles.landScapeImage[0].filename
              : reqBody.landScapeImage,
          hotelImages,
        }
      )
      // await User.updateMany(
      //   {},
      //   {
      //     $set: {
      //       // "bookings.$[elem].type": reqBody.type,
      //       "bookings.$[elem].commissionFee": reqBody.commissionFee,
      //       "bookings.$[elem].name": reqBody.name,
      //       "bookings.$[elem].price": parseInt(reqBody.price),
      //       "bookings.$[elem].description": reqBody.description,
      //       "bookings.$[elem].locationImage":
      //         !isEmpty(reqFiles) &&
      //         !isEmpty(reqFiles.locationImage) &&
      //         !isEmpty(reqFiles.locationImage[0].filename)
      //           ? reqFiles.locationImage[0].filename
      //           : reqBody.locationImage,
      //       "bookings.$[elem].landScapeImage":
      //         !isEmpty(reqFiles) &&
      //         !isEmpty(reqFiles.landScapeImage) &&
      //         !isEmpty(reqFiles.landScapeImage[0].filename)
      //           ? reqFiles.landScapeImage[0].filename
      //           : reqBody.landScapeImage,
      //       "bookings.$[elem].hotelImages": hotelImages,
      //     },
      //   },
      //   {
      //     arrayFilters: [{ "elem._id": reqBody._id }],
      //   }
      // );
    } else if (reqBody.section === "add") {
      let hotelImages = reqFiles.hotelImages.map((item) => item.filename)
      let count = await Booking.countDocuments({ type: reqBody.type })
      count = count + 1
      const booking = new Booking({
        // type: reqBody.type,
        name: reqBody.name,
        price: parseInt(reqBody.price),
        description: reqBody.description,
        locationImage: reqFiles.locationImage[0].filename,
        landScapeImage: reqFiles.landScapeImage[0].filename,
        hotelImages,
        taskNo: count,
        commissionFee: reqBody.commissionFee,
      })
      await User.updateMany(
        {},
        {
          $push: {
            bookings: {
              // // type: reqBody.type,
              _id: ObjectId(booking._id),
              // name: reqBody.name,
              count: 0,
              // price: parseInt(reqBody.price),
              // description: reqBody.description,
              // locationImage: reqFiles.locationImage[0].filename,
              // landScapeImage: reqFiles.landScapeImage[0].filename,
              // hotelImages,
              // taskNo: count,
              // commissionFee: reqBody.commissionFee,
              // status: "new",
            },
          },
        }
      )
      await booking.save()
    }

    return res.status(200).json({ success: true, messages: "success" })
  } catch (error) {
    console.log("ERROR", error)
    return res.status(500).json({ success: false, messages: "Error on server" })
  }
}
export const updateBooking = async (req, res) => {
  try {
    const reqBody = req.body
    let reqFiles = req.files
    let hotelImages = reqFiles.hotelImages.map((item) => item.filename)
    let count = await Booking.countDocuments({ type: reqBody.type })
    let packageData = await Package.findOne({ type: reqBody.type })
    if (!packageData) {
      return res.status(400).json({
        success: false,
        message: `Please add ${reqBody.type} package first`,
      })
    }
    if (packageData.price < reqBody.price) {
      return res.status(400).json({
        success: false,
        message: `Price must be lower than current package price`,
      })
    }
    count = count + 1
    await Booking.updateOne(
      { _id: ObjectId(reqBody._id) },
      {
        type: reqBody.type,
        name: reqBody.name,
        price: parseInt(reqBody.price),
        description: reqBody.description,
        locationImage: reqFiles.locationImage[0].filename,
        landscapeImage: reqFiles.landScapeImage[0].filename,
        hotelImages,
        taskNo: count,
      }
    )
    return res.status(200).json({ success: true, messages: "success" })
  } catch (error) {
    console.log("ERROR", error)
    return res.status(500).json({ success: false, messages: "Error on server" })
  }
}

export const getBookings = async (req, res) => {
  try {
    const userId = ObjectId(req.user.id)
    const [userData, walletData, bonusList] = await Promise.all([
      User.findOne({ _id: userId }, { taskCount: 1 }),
      Wallet.findOne({ _id: userId }, { totalBalance: 1 }),
      Bonus.find({
        userId: userId,
        status: "active",
        userStatus: "new",
      }),
    ])

    const totalBal = (parseInt(process.env.TASK_COUNT) * parseFloat(walletData?.totalBalance)) / 100
    let data = []

    if (userData.taskCount < parseInt(process.env.TASK_COUNT)) {
      data = await User.aggregate([
        {
          $match: { _id: userId },
        },
        {
          $unwind: "$bookings",
        },
        {
          $project: {
            "bookings._id": 1,
            "bookings.count": 1,
          },
        },
        {
          $lookup: {
            from: "booking",
            localField: "bookings._id",
            foreignField: "_id",
            as: "bookingsData",
          },
        },
        {
          $unwind: "$bookingsData",
        },
        {
          $match: {
            "bookingsData.price": {
              $lte: walletData?.totalBalance,
              $gte: totalBal,
            },
          },
        },
        {
          $sort: {
            "bookings.count": 1,
            "bookingsData.price": 1,
          },
        },
        {
          $limit: 1,
        },
        {
          $project: {
            _id: "$bookingsData._id",
            price: "$bookingsData.price",
            status: "$bookingsData.status",
            name: "$bookingsData.name",
            type: "$bookingsData.type",
            description: "$bookingsData.description",
            count: "$bookings.count",
            commissionFee: "$bookingsData.commissionFee",
            hotelImages: {
              $map: {
                input: "$bookingsData.hotelImages",
                as: "image",
                in: {
                  $concat: [`${config.IMAGE_URL}/hotelImages/`, "$$image"],
                },
              },
            },
            landScapeImage: {
              $concat: [
                `${config.IMAGE_URL}/landScapeImage/`,
                "$bookingsData.landScapeImage",
              ],
            },
            locationImage: {
              $concat: [
                `${config.IMAGE_URL}/locationImage/`,
                "$bookingsData.locationImage",
              ],
            },
          },
        },
      ])
    }
console.log("Data", data)
    let noData = {}
    if (data.length === 0 || userData.taskCount > parseInt(process.env.TASK_COUNT)) {
      noData = await Booking.aggregate([
        {
          $limit: 1,
        },
        {
          $project: {
            _id: 1,
            price: 1,
            name: 1,
            type: 1,
            description: 1,
            commissionFee: 1,
            hotelImages: {
              $map: {
                input: "$hotelImages",
                as: "image",
                in: {
                  $concat: [`${config.IMAGE_URL}/hotelImages/`, "$$image"],
                },
              },
            },
            landScapeImage: {
              $concat: [
                `${config.IMAGE_URL}/landScapeImage/`,
                "$landScapeImage",
              ],
            },
            locationImage: {
              $concat: [`${config.IMAGE_URL}/locationImage/`, "$locationImage"],
            },
          },
        },
      ])
      noData = noData[0] || {}
    }

    let result = {
      data: data.length > 0 ? [data[0]] : [],
      noData,
      bonusData: bonusList,
    }

    return res.status(200).json({
      success: true,
      bonus: bonusList.length > 0,
      message: "success",
      result,
    })
  } catch (error) {
    console.error("ERROR", error)
    return res.status(500).json({ success: false, message: "Error on server" })
  }
}

export const updateWalletPending = async (req, res) => {
  try {
    await Wallet.updateOne(
      { _id: ObjectId(req.user.id) },
      {
        $inc: {
          pendingAmount: req.body.price,
        },
      }
    )
    return res.status(200).json({ success: true, message: "success" })
  } catch (error) {
    return res.status(500).json({ success: false, messages: "Error on server" })
  }
}
export const getAllBookings = async (req, res) => {
  try {
    let pagination = paginationQuery(req.query)
    let filter = columnFillter(req.query, req.headers.timezone)
    let sortObj = !isEmpty(JSON.parse(req.query.sortObj))
      ? JSON.parse(req.query.sortObj)
      : { _id: -1 }

    filter["$expr"] = { $and: [] }

    if (filter.commissionFee) {
      filter.$expr.$and.push({
        $regexMatch: {
          input: { $toString: "$commissionFee" },
          regex: filter.commissionFee,
        },
      })
      delete filter["commissionFee"]
    }

    if (filter.price) {
      filter.$expr.$and.push({
        $regexMatch: {
          input: { $toString: "$price" },
          regex: filter.price,
        },
      })
      delete filter["price"]
    }

    let count = await Booking.countDocuments()
    let data = await Booking.find(filter)
      .sort(sortObj)
      .skip(pagination.skip)
      .limit(pagination.limit)
    return res.status(200).json({
      success: true,
      messages: "success",
      result: { data, count },
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      messages: "Error on server",
    })
  }
}
export const getSingleBooking = async (req, res) => {
  try {
    let data = await Booking.findOne({ _id: ObjectId(req.query._id) })
    return res.status(200).json({
      success: true,
      message: "Package fetched successfully",
      result: {
        data,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error on Server",
    })
  }
}

export const getBookingByFilter = async (req, res) => {
  try {
    let { query } = req

    let data = await Booking.find({
      $expr: {
        $gte: [{ $toInt: "$price" }, Number(query.price)],
      },
    })
      .sort({ price: 1 })
      .limit(10)

    return res.json({ success: true, result: data })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" })
  }
}

export const premiumTaskUpdate = async (req, res) => {
  let reqBody = req.body
  reqBody.commissionFee = reqBody.commission
  // return
  try {
    let err = {}
    // if (isEmpty(reqBody.price)) {
    //   err.price = "Please fill the price field";
    // }
    if (isEmpty(reqBody.hotelPrice)) {
      err.hotelPrice = "Please fill the hotelPrice field"
    }
    if (isEmpty(reqBody.commissionFee)) {
      err.commission = "Please fill the commissionFee field"
    }
    if (isEmpty(reqBody.taskNo)) {
      err.taskNo = "Please fill the task Number field"
    }

    // if (reqBody.price !== "" && parseInt(reqBody.price) <= 0) {
    //   err["price"] = "Invalid Value";
    // }
    if (reqBody.commissionFee !== "" && parseInt(reqBody.commissionFee) <= 0) {
      err["commission"] = "Invalid Value"
    }
    if (reqBody.taskNo !== "" && parseInt(reqBody.taskNo) <= 0) {
      err.taskNo = "Invalid Value"
    }
    if (!isEmpty(err)) {
      return res.status(400).json({
        success: false,
        errors: err,
      })
    }
    if (reqBody.hotelLength > 0 && isEmpty(reqBody.hotelId)) {
      return res.status(400).json({
        success: false,
        message: "Please select the hotel",
      })
    }
    let userData = await User.findOne({ _id: ObjectId(reqBody.userId) })
    if (userData.badge == "trial") {
      return res.status(400).json({
        success: false,
        message: "you can't add premium task to this user",
      })
    }
    let premiumData = await PremiumTask.findOne({
      _id: ObjectId(reqBody.userId),
      taskNo: reqBody.taskNo,
      status: "new",
    })

    if (premiumData) {
      return res.status(400).json({
        success: false,
        message: "You've already added the premium task to this Task Number",
      })
    }
    let bookingData = await Booking.findOne({ _id: ObjectId(reqBody.hotelId) })

    let hotelImages = []
    for (let i = 0; i < bookingData.hotelImages.length; i++) {
      hotelImages.push(
        `${bookingData.hotelImages[i]}`
      )
    }
    let premiumTask = new PremiumTask({
      userId: ObjectId(reqBody.userId),
      amount: bookingData.price,
      commissionFee: reqBody.commissionFee,
      taskNo: reqBody.taskNo,
      hotelImages: hotelImages,
      landScapeImage: bookingData.landScapeImage,
      locationImage: bookingData.locationImage,
      description: bookingData.description,
      name: bookingData.name,
    })
    await premiumTask.save()

    const adminLogs = new AdminLogs({
      adminEmail: req.user.email,
      adminUserId: req.user.id,
      taskType: "PREMIUM_TASK_ASSIGNED",
      userId: reqBody.userId,
      userCode: userData.userId,
      taskDescription: `premium task assigned in task No: ${reqBody.taskNo}
      }`,
    })

    await adminLogs.save()
    return res.status(200).json({
      success: true,
      message: "updated successfully",
    })
  } catch (error) {
    console.log("ERROR", error)
    return res.status(500).json({
      success: false,
      message: "Error on Server",
    })
  }
}
export const premiumTaskCancel = async (req, res) => {
  let reqBody = req.body
  try {
    if (isEmpty(reqBody.userId) || isEmpty(reqBody.premiumId)) {
      return res.status(400).json({
        success: false,
        message: "",
      })
    }
    const premiumTask = await PremiumTask.findOneAndUpdate(
      {
        _id: ObjectId(reqBody.premiumId),
        userId: ObjectId(reqBody.userId),
      },
      {
        $set: {
          status: "canceled",
        },
      }
    )
    const userData = await User.findOne(
      { _id: ObjectId(reqBody.userId) },
      { userId: 1 }
    ).lean()
console.log("UserCancel", userData)
    const adminLogs = new AdminLogs({
      adminEmail: req.user.email,
      adminUserId: req.user.id,
      taskType: "PREMIUM_TASK_CANCELED",
      userId: reqBody.userId,
      userCode: userData.userId,
      taskDescription: `Premium task canceled for this user which was assigned in task No: ${premiumTask.taskNo}
      }`,
    })

    await adminLogs.save()
    return res.status(200).json({
      success: true,
      message: "Canceled successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error on Server",
    })
  }
}
export const premiumTaskHistory = async (req, res) => {
  try {
    let pagination = paginationQuery(req.query)
    let filter = columnFillter(req.query, req.headers.timezone)
    const seqNo = req.user.seqNo == 0 ? {} : { adminSeqNo: req.user.seqNo }

    let data = await PremiumTask.find({ ...filter })
      .populate({
        path: "userId",
        match: { ...seqNo },
      })
      .sort({ updatedAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)

    if (!data) {
      return res.status(200).json({
        success: true,
        message: "There is no data",
        result: { data: [], count: 0 },
      })
    } else {
      return res.status(200).json({
        success: true,
        message: "Fetched successfully",
        result: { data, count: data.length },
      })
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error on Server",
    })
  }
}
export const premiumTaskEdit = async (req, res) => {
  let reqBody = req.body
  reqBody.commissionFee = reqBody.commission
  try {
    let err = {}
    // if (isEmpty(reqBody.price)) {
    //   err.price = "Please fill the price field";
    // }
    if (isEmpty(reqBody.hotelPrice)) {
      err.hotelPrice = "Please fill the hotelPrice field"
    }
    if (isEmpty(reqBody.commissionFee)) {
      err.commission = "Please fill the commissionFee field"
    }
    if (isEmpty(reqBody.taskNo)) {
      err.taskNo = "Please fill the task Number field"
    }

    // if (reqBody.price !== "" && parseInt(reqBody.price) <= 0) {
    //   err["price"] = "Invalid Value";
    // }
    if (reqBody.commissionFee !== "" && parseInt(reqBody.commissionFee) <= 0) {
      err["commission"] = "Invalid Value"
    }
    if (reqBody.taskNo !== "" && parseInt(reqBody.taskNo) <= 0) {
      err.taskNo = "Invalid Value"
    }
    if (!isEmpty(err)) {
      return res.status(400).json({
        success: false,
        errors: err,
      })
    }

    let userData = await User.findOne({ _id: ObjectId(reqBody.userId) })
    if (userData.badge == "trial") {
      return res.status(400).json({
        success: false,
        message: "you can't add premium task to this user",
      })
    }

    if (isEmpty(reqBody.hotelId)) {
      let checkTask = await PremiumTask.findOne({
        userId: reqBody.userId,
        status: "new",
      })
      if (isEmpty(checkTask)) {
        return res
          .status(400)
          .json({ success: false, message: "Task not found" })
      }
      await PremiumTask.findOneAndUpdate(
        {
          userId: reqBody.userId,
          status: "new",
        },
        {
          $set: {
            userId: ObjectId(reqBody.userId),
            commissionFee: reqBody.commissionFee,
            taskNo: reqBody.taskNo,
          },
        },
        {
          upsert: true,
        }
      )
    } else {
      let hotelImages = []
      let bookingData = await Booking.findOne({
        _id: ObjectId(reqBody.hotelId),
      })
      if (isEmpty(bookingData)) {
        return res
          .status(400)
          .json({ success: false, message: "Booking not found" })
      }
      for (let i = 0; i < bookingData.hotelImages.length; i++) {
        hotelImages.push(
          `${bookingData.hotelImages[i]}`
        )
      }
      await PremiumTask.findOneAndUpdate(
        {
          userId: ObjectId(reqBody.userId),
          status: "new",
        },
        {
          $set: {
            userId: ObjectId(reqBody.userId),
            amount: bookingData.price,
            commissionFee: reqBody.commissionFee,
            taskNo: reqBody.taskNo,
            hotelImages: hotelImages,
            landScapeImage: bookingData.landScapeImage,
            locationImage: bookingData.locationImage,
            description: bookingData.description,
            name: bookingData.name,
          },
        },
        {
          upsert: true,
        }
      )
    }
    const adminLogs = new AdminLogs({
      adminEmail: req.user.email,
      adminUserId: req.user.id,
      taskType: "PREMIUM_TASK_UPDATED",
      userId: reqBody.userId,
      userCode: userData.userId,
      taskDescription: `Premium task edited in task No: ${reqBody.taskNo}
      }`,
    })

    await adminLogs.save()
    return res.status(200).json({
      success: true,
      message: "updated successfully",
    })
  } catch (error) {
    console.log("ERROR", error)
    return res.status(500).json({
      success: false,
      message: "Error on Server",
    })
  }
}

export const getPremiumTask = async (req, res) => {
  try {
    let reqBody = req.query
    let premiumData = await PremiumTask.findOne({
      userId: ObjectId(reqBody.userId),
      status: "new",
    })
    if (isEmpty(premiumData)) {
      return res.status(400).json({
        success: false,
        message: "Not found",
      })
    }
    return res.status(200).json({
      success: true,
      message: "Success",
      data: premiumData,
    })
  } catch (err) {
    return res.status(500).json({
      success: true,
      message: "Error on server",
    })
  }
}

export const getBookingHistory = async (req, res) => {
  try {
    const data = await BookingHistory.find({ userId: req.user.id }).sort({
      createdAt: -1,
    })

    return res.status(200).json({
      success: true,
      message: "Package fetched successfully",
      result: {
        data,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error on Server",
    })
  }
}
// new

// export const purchase = async (req, res) => {
//   try {
//     const { body: reqBody, user } = req
//     const commissionFee =
//       parseFloat(reqBody.commissionFee) * parseFloat(reqBody.price)
//     const userData = await User.findById(user.id)
//     const walletData = await Wallet.findById(user.id)

//     let premiumData = null
//     if (userData && userData.taskCount) {
//       premiumData = await PremiumTask.findOne({
//         userId: user.id,
//         taskNo: userData.taskCount + 1,
//         status: "new",
//       })
//     }

//     if (premiumData) {
//       const pending =
//         parseFloat(walletData.totalBalance) +
//         parseFloat(commissionFee) +
//         parseFloat(premiumData.amount)
//       createPassbook({
//         type: "PREMIUM_TASK_DEDUCTION",
//         amount: walletData.levelBonus,
//         beforeBalance: walletData.totalBalance,
//         afterBalance:
//           parseFloat(walletData.totalBalance) - parseFloat(premiumData.amount),
//         category: "debit",
//         tableId: premiumData._id,
//         userId: user.id,
//         userCodeId: userData.userId,
//         pendingBalanceBefore: walletData.pendingAmount,
//         pendingBalanceAfter:
//           parseFloat(walletData.pendingAmount) + parseFloat(pending),
//         todayCommissionBefore: walletData.todayCommission,
//         todayCommissionAfter: walletData.todayCommission,
//       })
//       walletData.totalBalance = -parseFloat(premiumData.amount)
//       walletData.pendingAmount += parseFloat(pending)
//       walletData.todayCommission += parseFloat(commissionFee)
//       walletData.totalCommission += parseFloat(commissionFee)
//     } else {
//       if (walletData.totalBalance < config.MINIMUM_BALANCE) {
//         return res.status(400).json({
//           success: false,
//           message: `You need to maintain at least ${config.MINIMUM_BALANCE} as your balance.`,
//         })
//       }
//       createPassbook({
//         type: "COMMISSION_CREDIT",
//         amount: walletData.levelBonus,
//         beforeBalance: walletData.totalBalance,
//         afterBalance:
//           parseFloat(walletData.totalBalance) + parseFloat(commissionFee),
//         category: "credit",
//         tableId: "",
//         userId: user.id,
//         userCodeId: userData.userId,
//         pendingBalanceBefore: walletData.pendingAmount,
//         pendingBalanceAfter: parseFloat(walletData.pendingAmount),
//         todayCommissionAfter:
//           parseFloat(walletData.todayCommission) + parseFloat(commissionFee),
//         todayCommissionBefore: walletData.todayCommission,
//       })
//       walletData.totalBalance += parseFloat(commissionFee)
//       walletData.todayCommission += parseFloat(commissionFee)
//       walletData.totalCommission += parseFloat(commissionFee)
//     }

//     if (userData.badge === "trial" && reqBody.taskCount + 1 === 30) {
//       createPassbook({
//         type: "TRIAL_BONUS_DEBIT",
//         amount: walletData.levelBonus,
//         beforeBalance: walletData.totalBalance,
//         afterBalance:
//           parseFloat(walletData.totalBalance) -
//           parseFloat(walletData.levelBonus),
//         category: "debit",
//         tableId: "",
//         userId: user.id,
//         userCodeId: userData.userId,
//         pendingBalanceBefore: walletData.pendingAmount,
//         pendingBalanceAfter: walletData.pendingAmount,
//         todayCommissionBefore: walletData.todayCommission,
//         todayCommissionAfter: walletData.todayCommission,
//       })
//       await Wallet.updateOne(
//         { _id: user.id },
//         {
//           $inc: { totalBalance: -walletData.levelBonus },
//           $set: { levelBonus: 0 },
//         }
//       )
//       userData.badge = "levelUp"
//       userData.taskCount += 1
//     } else if (userData.taskCount === 30) {
//       return res.status(400).json({
//         success: false,
//         message: "You have completed today's tasks.",
//       })
//     } else {
//       userData.taskCount += 1
//     }

//     await userData.save()

//     if (reqBody.premium) {
//       await PremiumTask.updateOne(
//         { userId: user.id, _id: reqBody.taskId },
//         { $set: { status: "completed" } }
//       )
//     } else {
//       await User.updateOne(
//         { _id: user.id, "bookings._id": reqBody.taskId },
//         { $inc: { "bookings.$[element].count": 1 } },
//         { arrayFilters: [{ "element._id": reqBody.taskId }] }
//       )
//     }

//     createBookingHistory({
//       type: "RATING_PRINCIPLE",
//       field: "totalBalance",
//       balBefore: walletData.totalBalance,
//       userId: user.id,
//       amount: parseFloat(reqBody.price),
//       balAfter: parseFloat(walletData.totalBalance) - parseFloat(reqBody.price),
//     })
//     createBookingHistory({
//       type: "RATING_PRINCIPLE_RETURN",
//       field: "totalBalance",
//       userId: user.id,
//       balBefore:
//         parseFloat(walletData.totalBalance) - parseFloat(reqBody.price),
//       amount: parseFloat(reqBody.price),
//       balAfter: parseFloat(walletData.totalBalance) + parseFloat(reqBody.price),
//     })
//     createBookingHistory({
//       type: "COMMISSION_RECEIVED",
//       field: "totalCommission",
//       userId: user.id,
//       balBefore: walletData.totalCommission,
//       amount: parseFloat(commissionFee),
//       balAfter:
//         parseFloat(walletData.totalCommission) + parseFloat(commissionFee),
//     })

//     return res.status(200).json({
//       success: true,
//       message: "Purchase successful.",
//       result: {
//         data: { taskCount: userData.taskCount },
//       },
//     })
//   } catch (error) {
//     console.error("Error:", error)
//     return res.status(500).json({ success: false, message: "Server error." })
//   }
// }
export const purchase = async (req, res) => {
  // new
  // new taskId,taskNo (from User Schema),levelBonus(if user is trial)
  try {
    let reqBody = req.body
    let trialFinished = false
    console.log("REQBODY", reqBody)
    let commissionFee =
      (parseFloat(reqBody.commissionFee) * parseFloat(reqBody.price)) / 100
    let userData = await User.findOne({ _id: ObjectId(req.user.id) })
    let walletData = await Wallet.findOne({ _id: ObjectId(req.user.id) })
    let premiumData = await PremiumTask.findOne({
      userId: ObjectId(req.user.id),
      taskNo: userData.taskCount + 1,
      status: "new",
    })
    if (!isEmpty(premiumData)) {
      let pending =
        parseFloat(walletData.totalBalance) +
        parseFloat(commissionFee) +
        parseFloat(premiumData.amount)
      createPassbook({
        type: "PREMIUM_TASK_DEDUCTION",
        amount: walletData.levelBonus,
        beforeBalance: walletData.totalBalance,
        afterBalance:
          parseFloat(walletData.totalBalance) - -parseFloat(premiumData.amount),
        category: "debit",
        tableId: premiumData._id,
        userId: req.user.id,
        userCodeId: userData.userId,
        pendingBalanceBefore: walletData.pendingAmount,
        pendingBalanceAfter:
          parseFloat(walletData.pendingAmount) + parseFloat(pending),
        todayCommissionBefore: walletData.todayCommission,
        todayCommissionAfter: walletData.todayCommission,
      })
      walletData.totalBalance = -parseFloat(premiumData.amount)
      walletData.pendingAmount += parseFloat(pending)
      walletData.todayCommission += parseFloat(commissionFee)
      walletData.totalCommission += parseFloat(commissionFee)

      await walletData.save()
    } else {
      if (walletData.totalBalance < config.MINIMUM_BALANCE) {
        return res.status(400).json({
          success: false,
          message: `You need to maintain at least ${config.MINIMUM_BALANCE} as your balance.`,
        })
      }
      createPassbook({
        type: "COMMISSION_CREDIT",
        amount: walletData.levelBonus,
        beforeBalance: walletData.totalBalance,
        afterBalance:
          parseFloat(walletData.totalBalance) + parseFloat(commissionFee),
        category: "credit",
        tableId: "",
        userId: req.user.id,
        userCodeId: userData.userId,
        pendingBalanceBefore: walletData.pendingAmount,
        pendingBalanceAfter: parseFloat(walletData.pendingAmount),
        todayCommissionAfter:
          parseFloat(walletData.todayCommission) + parseFloat(commissionFee),
        todayCommissionBefore: walletData.todayCommission,
      })
      walletData.totalBalance += parseFloat(commissionFee)
      walletData.todayCommission += parseFloat(commissionFee)
      walletData.totalCommission += parseFloat(commissionFee)
      await walletData.save()
    }

    if (userData.badge === "trial" && userData.taskCount + 1 == parseInt(process.env.TASK_COUNT)) {

      createPassbook({
        type: "TRIAL_BONUS_DEBIT",
        amount: walletData.levelBonus,
        beforeBalance: walletData.totalBalance,
        afterBalance:
          parseFloat(walletData.totalBalance) -
          parseFloat(walletData.levelBonus),
        category: "debit",
        tableId: "",
        userId: req.user.id,
        userCodeId: userData.userId,
        pendingBalanceBefore: walletData.pendingAmount,
        pendingBalanceAfter: walletData.pendingAmount,
        todayCommissionBefore: walletData.todayCommission,
        todayCommissionAfter: walletData.todayCommission,
      })
      await Wallet.updateOne(
        {
          _id: ObjectId(req.user.id),
        },
        {
          $inc: {
            totalBalance: -walletData.levelBonus,
          },
          $set: {
            levelBonus: 0,
          },
        }
      )
      // walletData.totalBalance -= walletData.levelBonus;
      // walletData.levelBonus = 0
      // await walletData.save();
      userData.badge = "levelUp"
      userData.taskCount += 1
      trialFinished = true

    } else if (userData.taskCount === parseInt(process.env.TASK_COUNT)) {
      return res.status(400).json({
        success: false,
        message: "You are completed the today's task",
      })
      // userData.taskBlocked = true;
      // userData.taskCount = 0;
    } else {
      userData.taskCount += 1
    }
    await userData.save()

    if (reqBody.premium) {
      await PremiumTask.updateOne(
        {
          userId: ObjectId(req.user.id),
          _id: ObjectId(reqBody.taskId),
        },
        {
          $set: {
            status: "completed",
          },
        }
      )
    } else {
      await User.updateOne(
        {
          _id: ObjectId(req.user.id),
          "bookings._id": reqBody.taskId,
        },
        {
          // $set: {
          //   "bookings.$[element].status": "purchased",
          // },
          $inc: {
            "bookings.$[element].count": 1,
          },
        },
        {
          arrayFilters: [
            {
              "element._id": reqBody.taskId,
            },
          ],
        }
      )
    }
    createBookingHistory({
      type: "RATING_PRINCIPLE",
      field: "totalBalance",
      balBefore: walletData.totalBalance,
      userId: req.user.id,
      amount: parseFloat(reqBody.price),
      balAfter: parseFloat(walletData.totalBalance) - parseFloat(reqBody.price),
    })
    createBookingHistory({
      type: "RATING_PRINCIPLE_RETURN",
      field: "totalBalance",
      userId: req.user.id,
      balBefore:
        parseFloat(walletData.totalBalance) - parseFloat(reqBody.price),
      amount: parseFloat(reqBody.price),
      balAfter: parseFloat(walletData.totalBalance) + parseFloat(reqBody.price),
    })
    createBookingHistory({
      type: "COMMISSION_RECEIVED",
      field: "totalCommission",
      userId: req.user.id,
      balBefore: walletData.totalCommission,
      amount: parseFloat(commissionFee),
      balAfter:
        parseFloat(walletData.totalCommission) + parseFloat(commissionFee),
    })

    return res.status(200).json({
      success: true,
      message: "Purchased successfully",
      result: {
        data: {
          taskCount: userData.taskCount,
        },
      },
    })
  } catch (error) {
    console.log("ERROR", error)
    return res.status(500).json({ success: false, message: "Error on server" })
  }
}
let cronStatus = false
commissionFeeZeroCron.start()
export const commissionZero = async () => {
  try {
    if (cronStatus == true) return
    cronStatus = true
    await Wallet.updateMany(
      {},
      {
        $set: {
          todayCommission: 0,
        },
      }
    )
    cronStatus = false
  } catch (error) {
    console.log("COMMISSION ZERO ERROR", error?.message)
  }
}
export const addBonus = async (req, res) => {
  try {
    const seqNo = req.user.seqNo == 0 ? {} : { adminSeqNo: req.user.seqNo }

    let reqBody = req.body
    if (parseFloat(reqBody.amount) <= 0) {
      return res.json({
        success: false,
        message: "Bonus cannot be less than zero",
      })
    }

    let user = await User.findById(reqBody.userId, { userId: 1, taskCount: 1 })
    if (user.taskCount >= parseInt(reqBody.taskCount)) {
      return res.status(400).json({
        success: false,
        message: `The task count should be more than current task, current task is ${user.taskCount}`,
      })
    }
    let bonus = new Bonus({
      ...seqNo,
      userId: reqBody.userId,
      userCode: user.userId,
      amount: reqBody.amount,
      status: reqBody.status,
      taskCount: reqBody.taskCount,
      userStatus: "new",
    })
    await bonus.save()
    const adminLogs = new AdminLogs({
      adminEmail: req.user.email,
      adminUserId: req.user.id,
      taskType: "USER_BONUS_ADDED",
      userId: reqBody.userId,
      userCode: user.userId,
      taskDescription: `Bonus added for this user in task no: ${reqBody.taskCount}`,
    })

    await adminLogs.save()
    return res.status(200).json({
      success: true,
      message: "Bonus added successfully",
    })
  } catch (error) {
    console.log("ERROR", error)
    return res.status(500).json({
      success: false,
      message: "Error on Server",
    })
  }
}
export const updateBonus = async (req, res) => {
  try {
    let reqBody = req.body
    if (parseFloat(reqBody.amount) <= 0) {
      return res.json({
        success: false,
        message: "Bonus cannot be less than zero",
      })
    }
    const bonusData = await Bonus.findOneAndUpdate(
      { _id: reqBody._id },
      {
        $set: {
          amount: reqBody.amount,
          status: reqBody.status,
          taskCount: reqBody.taskCount,
        },
      }
    )
    const adminLogs = new AdminLogs({
      adminEmail: req.user.email,
      adminUserId: req.user.id,
      taskType: "USER_BONUS_UPDATED",
      userId: bonusData.userId,
      userCode: bonusData.userCode,
      taskDescription: `Bonus modified for this user in task no: ${reqBody.taskCount}`,
    })

    await adminLogs.save()
    return res.status(200).json({
      success: true,
      message: "Bonus updated successfully",
    })
  } catch (error) {
    console.log("BONUS_UPDATE_ERROR", error)
    return res.status(500).json({
      success: false,
      message: "Error on Server",
    })
  }
}

export const getSingleBonus = async (req, res) => {
  try {
    const { params } = req

    let data = await Bonus.findOne({ _id: params.id })

    if (!data) {
      return res.status(400).json({ success: false, message: "No data found" })
    }

    return res.json({ success: true, result: data || "" })
  } catch (error) {
    console.log("GET_SINGLE_BONUS_ERROR", error)
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" })
  }
}

export const getBonusList = async (req, res) => {
  try {
    let reqBody = req.query
    let filter = columnFillter(reqBody)
    if (filter?.status?.$eq == ".") filter.status = new RegExp(".", "i")
    let bonusList = await Bonus.find({
      userId: new mongoose.Types.ObjectId(reqBody.userId),
      ...filter,
    }).sort({
      _id: -1,
    })
    return res.status(200).json({
      success: true,
      message: "Bonus fetched successfully",
      result: {
        data: { bonus: bonusList, count: bonusList.length },
      },
    })
  } catch (error) {
    console.log("GET_BONUS_LIST_ERROR", error)
    return res.status(500).json({
      success: false,
      message: "Error on Server",
    })
  }
}
export const getUserBonusList = async (req, res) => {
  try {
    let bonusList = await Bonus.find({ userId: ObjectId(req.user.id) })
    return res.status(200).json({
      success: true,
      message: "Bonus fetched successfully",
      result: {
        data: bonusList,
      },
    })
  } catch (error) {
    console.log("GET_USER_BONUS_LIST_ERROR", error)
    return res.status(500).json({
      success: false,
      message: "Error on Server",
    })
  }
}
export const updateUserBonus = async (req, res) => {
  try {
    let reqBody = req.body
    let userData = await Bonus.findOne({
      userId: ObjectId(req.user.id),
      _id: reqBody.bonusId,
      // userStatus:"new"
    })
    if (userData.userStatus == "completed") {
      return res.status(400).json({
        success: false,
        message: "Your bonus was already updated",
      })
    }
    userData.userStatus = "completed"
    await userData.save()
    let walletData = await Wallet.findOneAndUpdate(
      {
        _id: ObjectId(req.user.id),
      },
      {
        $inc: {
          totalBalance: reqBody.amount,
        },
      }
    )
    createPassbook({
      type: "USER_BONUS_CREDIT",
      amount: reqBody.amount,
      beforeBalance:
        parseFloat(walletData.totalBalance) - parseFloat(reqBody.amount),
      afterBalance: parseFloat(walletData.totalBalance),
      category: "credit",
      tableId: reqBody.bonusId,
      userId: req.user.id,
      userCodeId: IncCntObjId(req.user.id),
      pendingBalanceBefore: walletData.pendingAmount,
      pendingBalanceAfter: parseFloat(walletData.pendingAmount),
      todayCommissionBefore: walletData.todayCommission,
      todayCommissionAfter: walletData.todayCommission,
    })
    createBookingHistory({
      amount: reqBody.amount,
      balAfter: walletData.totalBalance,
      balBefore: parseInt(walletData.totalBalance),
      type: "BONUS_UPDATE",
      userId: req.user.id,
    })
    return res.status(200).json({
      success: true,
      message: "Bonus updated successfully",
    })
  } catch (error) {
    console.log("ERROR", error)
    return res.status(500).json({
      success: false,
      message: "Error on Server",
    })
  }
}
export const getUserPremium = async (req, res) => {
  try {
    let userData = await User.findOne({ _id: ObjectId(req.user.id) })
    let premiumData = await PremiumTask.find({
      userId: ObjectId(req.user.id),
      status: "new",
      taskNo: userData.taskCount,
    })
    console.log("PREDATA", premiumData)
    if (premiumData.length == 0) {
      return res.status(400).json({ success: false, message: "No data found" })
    }
    return res.json({
      success: true,
      result: {
        data: premiumData,
      },
    })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" })
  }
}
