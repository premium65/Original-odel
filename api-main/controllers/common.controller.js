// import package
import mongoose from "mongoose"
import isEmpty from "../lib/isEmpty"

// import lib
import { paginationQuery, columnFillter } from "../lib/adminHelpers"

// import model
import {
  SiteSetting,
  ipAddress,
  Contact,
  NewsLetter,
  SliderManage,
  Passbook,
  ReviewContext,
} from "../models"

const ObjectId = mongoose.Types.ObjectId

export const getbranddetails = async (req, res) => {
  try {
    let siteSettingData = await SiteSetting.findOne({})
    if (siteSettingData) {
      return res.status(200).json({
        success: true,
        message: "Fetch success",
        result: siteSettingData,
      })
    }
    return res.status(400).json({ success: false, message: "No record" })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" })
  }
}

/**
 * Ip Management
 * URL : /api/admin/IpRestriction
 * METHOD : post
 */

export const addIpRestrict = async (req, res) => {
  try {
    let reqBody = req.body
    let newData = new ipAddress({
      ip: reqBody.ipAddress,
    })
    await newData.save()
    res.status(200).json({ success: true, message: "IP Added Successfully" })
  } catch (err) {
    console.log("errrrr ////", err)
    res.status(500).json({ success: false, message: "error on server" })
  }
}

/**
 * Ip Management
 * URL : /api/admin/IpRestriction
 * METHOD : get
 */

export const getIpRestrictData = async (req, res) => {
  try {
    let pagination = paginationQuery(req.query)
    let filter = columnFillter(req.query, req.headers.timezone)
    let count = await ipAddress.countDocuments(filter)
    const ipData = await ipAddress
      .find(filter)
      .sort({ _id: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
    const result = {
      data: ipData,
      count: count,
    }
    res.status(200).json({ success: true, result })
  } catch (err) {
    console.log("errrrr ////", err)
    res.status(500).json({ success: false, message: "error on server" })
  }
}

/**
 * Ip Management
 * URL : /api/admin/IpRestriction
 * METHOD : delete
 */

export const deleteIp = async (req, res) => {
  try {
    await ipAddress.findByIdAndRemove({ _id: ObjectId(req.body.id) })
    res.status(200).json({ success: true, message: "IP Deleted Successfully" })
  } catch (err) {
    console.log("errrrr ////", err)
    res.status(500).json({ success: false, message: "error on server" })
  }
}

//get contactus data
export const getcontactus = async (req, res) => {
  try {
    let filter = {}
    filter = columnFillter(req.query, req.headers.timezone)
    let pagination = paginationQuery(req.query)
    let sortObj = !isEmpty(JSON.parse(req.query.sortObj))
      ? JSON.parse(req.query.sortObj)
      : { _id: -1 }
    filter["status"] = "active"
    filter["softDelete"] = "false"
    let count = await Contact.countDocuments(filter)
    let data = await Contact.find(filter)
      .sort(sortObj)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .sort(sortObj)
    if (data && data.length > 0) {
      let respData = {
        count: count,
        data,
      }
      return res
        .status(200)
        .json({ success: true, message: "Fetch success", result: respData })
    }
    return res.status(400).json({ success: false, message: "No record" })
  } catch (err) {
    console.log("errrr", err)
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" })
  }
}

export const removecotactus = async (req, res) => {
  try {
    console.log("req", req.body._id)
    let data = await Contact.findOneAndUpdate(
      { _id: req.body._id },
      { status: "deactive" }
    )
    console.log(data, "sdfsdfsafs")
    if (!data) {
      return res.status(400).json({ success: false, message: "Not a record" })
    }
    return res
      .status(200)
      .json({ success: true, message: "Delete successfully" })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" })
  }
}

export const addContactus = async (req, res) => {
  try {
    let reqBody = req.body

    const newContact = new Contact({
      email: reqBody.email,
      name: reqBody.firstname,
      firstname: reqBody.firstname,
      lastname: reqBody.lastname,
      message: reqBody.message,
    })

    await newContact.save()

    return res
      .status(200)
      .json({ status: true, message: "Your Message submitted successfully" })
  } catch (err) {
    console.log(err, "--------")
    res.status(500).json({ status: false, message: "error on server" })
  }
}

export const getsiteSetting = async (req, res) => {
  SiteSetting.findOne({ adminSeqNo: req.user.adminSeqNo }).exec((err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Something went wrong" })
    }
    return res
      .status(200)
      .json({ success: true, message: "Fetch successfully", result: data })
  })
}

/**
 * Add Newsletter
 * METHOD : POST
 * URL : /api/newsSubscribe
 * BODY : email
 */
export const newSubscribe = async (req, res) => {
  try {
    let reqBody = req.body
    let checkDoc = await NewsLetter.findOne({ email: reqBody.email })
    if (checkDoc) {
      return res
        .status(500)
        .json({ status: false, errors: { email: "Email already Subscribed" } })
    }
    let newDoc = new NewsLetter({
      email: reqBody.email,
    })

    await newDoc.save()

    return res
      .status(200)
      .json({ status: true, message: "Newsletter subscribed successfully" })
  } catch (err) {
    console.log(err, "err")
    return res.status(500).json({ status: false, message: "Error on server" })
  }
}

/**
 * GET Newsletter
 * METHOD : GET
 * URL : /api/newsSubscribe
 * BODY : email
 */
export const GetSubscribes = async (req, res) => {
  try {
    let checkDoc = await NewsLetter.find({})
    if (checkDoc) {
      return res
        .status(200)
        .json({ status: true, message: "fetch success", result: checkDoc })
    }

    return res
      .status(400)
      .json({ status: true, message: "fetch success", result: [] })
  } catch (err) {
    console.log(err, "err")
    return res.status(500).json({ status: false, message: "Error on server" })
  }
}

export const AddSlider = async (req, res) => {
  try {
    console.log(req.file, "req.file----------------->")
    if (!isEmpty(req.file)) {
      let newData = new SliderManage({
        image: req.file.filename,
      })

      await newData.save()

      return res.status(200).json({ success: true, message: "Success" })
    }

    return res
      .status(400)
      .json({ success: true, message: "Slider Image Required!" })
  } catch (err) {
    console.log("Err0r---", err)
    return res.status(500).json({ success: false, message: "SOMETHING_WRONG" })
  }
}

export const GetSlider = async (req, res) => {
  try {
    let sliderData = await SliderManage.find({}).lean()
    return res
      .status(200)
      .json({ success: true, message: "Success", result: sliderData })
  } catch (err) {
    console.log("Err0r---", err)
    return res.status(500).json({ success: false, message: "SOMETHING_WRONG" })
  }
}

export const DeleteSlider = async (req, res) => {
  try {
    await SliderManage.findOneAndDelete({ _id: req.body._id })
    return res.status(200).json({ success: true, message: "Success" })
  } catch (err) {
    console.log("Err0r---", err)
    return res.status(500).json({ success: false, message: "SOMETHING_WRONG" })
  }
}
export const createPassbook = async (data) => {
  let {
    beforeBalance,
    afterBalance,
    amount,
    tableId,
    userId,
    userCodeId,
    type,
    category,
  } = data
  try {
    let passBook = new Passbook(data)
    await passBook.save()
    return true
  } catch (error) {
    console.log("PASSBOOK CREATION ERROR :", error)
    return false
  }
}

const createLandmarks = (landmarks, result, exist) => {
  if (landmarks.length <= 6) {
    return landmarks
  }
  if (result.length == 6) {
    return result
  }
  let randInt = Math.floor(Math.random() * landmarks.length)

  if (exist.includes(randInt)) {
    return createLandmarks(landmarks, result, exist)
  }

  result.push(landmarks[randInt])
  exist.push(randInt)
  return createLandmarks(landmarks, result, exist)
}

export const getReviewPlace = async (req, res) => {
  try {
    let addresses = await ReviewContext.find({ type: "address" }).distinct(
      "value"
    )
    let landmarks = await ReviewContext.find({ type: "landmark" }).distinct(
      "value"
    )

    let address = addresses[Math.floor(Math.random() * addresses.length)]
    let landmarkList = createLandmarks(landmarks, [], [])

    return res.json({ success: true, address, landmark: landmarkList })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" })
  }
}
