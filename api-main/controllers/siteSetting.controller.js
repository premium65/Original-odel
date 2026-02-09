// import package
import mongoose from "mongoose"
import multer from "multer"
import path from "path"
// import model
import { SiteSetting } from "../models"

//import lib
import imageFilter from "../lib/imageFilter"
import isEmpty from "../lib/isEmpty"

// import config
import config from "../config"
const ObjectId = mongoose.Types.ObjectId

/**
 * Multer Image Uploade
 */
const settingStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.IMAGE.SETTINGS_URL_PATH)
  },

  // By default, multer removes file extensions so let's add them back
  filename: function (req, file, cb) {
    cb(null, "siteSettings-" + Date.now() + path.extname(file.originalname))
  },
})

let settingsUpload = multer({
  storage: settingStorage,
  fileFilter: imageFilter,
  // limits: { fileSize: config.IMAGE.CURRENCY_SIZE }
}).fields([{ name: "emailLogo", maxCount: 1 }])

export const uploadSiteDetails = (req, res, next) => {
  settingsUpload(req, res, function (err) {
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
      console.log("update details error", err)
      return res
        .status(500)
        .json({ success: false, message: "SOMETHING_WRONG", error: err })
    }
    return next()
  })
}
/**
 * Get Site Setting
 * URL: /api/admin/getSiteSetting
 * METHOD : GET
 */
export const getSiteSetting = async (req, res) => {
  SiteSetting.find({}, {}, (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Something went wrong" })
    }
    return res
      .status(200)
      .json({ success: true, message: "Fetch success", result: data })
  })
}

/**
 * Get Site Setting
 * URL: /api/admin/updateSiteSetting
 * METHOD : PUT
 * BODY : marketTrend
 */
export const updateSiteSetting = async (req, res) => {
  try {
    let siteSettingData = await SiteSetting.findOne()
    if (!siteSettingData) {
      return res.status(400).json({ success: false, message: "No record" })
    }
    let reqBody = req.body

    siteSettingData.marketTrend = reqBody.marketTrend
      ? reqBody.marketTrend
      : siteSettingData.marketTrend

    let updateData = await siteSettingData.save()

    let result = {
      marketTrend: updateData.marketTrend,
    }
    return res
      .status(200)
      .json({ success: true, message: "Upate Successfully", result: result })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" })
  }
}

export const updateSiteDetails = async (req, res) => {
  try {
    const reqBody = req.body
    if (reqBody.type == "add") {
      let data = new SiteSetting({
        adminSeqNo: reqBody.seqNo,
        telegramLink: reqBody.telegramLink,
        whatsappLink: reqBody.whatsappLink,
        youtubeLink: reqBody.youtubeLink,
        twitterLink: reqBody.twitterLink,
        instagramLink: reqBody.instagramLink,
        tikTokLink: reqBody.tikTokLink,
        linkedinLink: reqBody.linkedinLink,
        faceBookLink: reqBody.faceBookLink,
      })
      await data.save()
    } else if (reqBody.type == "edit") {
      await SiteSetting.updateOne(
        { _id: ObjectId(reqBody.siteId) },
        {
          $set: {
            adminSeqNo: reqBody.seqNo,
            telegramLink: reqBody.telegramLink,
            whatsappLink: reqBody.whatsappLink,
            youtubeLink: reqBody.youtubeLink,
            twitterLink: reqBody.twitterLink,
            instagramLink: reqBody.instagramLink,
            tikTokLink: reqBody.tikTokLink,
            linkedinLink: reqBody.linkedinLink,
            faceBookLink: reqBody.faceBookLink,
          },
        }
      )
    }
    console.log("REQBODY", reqBody)
    return res
      .status(200)
      .json({ success: true, message: "Update Successfully" })
  } catch (err) {
    console.log("upload error", err)
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong", err: err })
  }
}

export const getSiteSet = async () => {
  try {
    let doc = await SiteSetting.findOne({ adminSeqNo: req.user.seqNo }).lean()

    if (!doc) {
      return {
        status: false,
      }
    }
    return {
      status: true,
      ...doc,
    }
  } catch (err) {
    console.log("----err", err)
    return {
      status: false,
    }
  }
}
