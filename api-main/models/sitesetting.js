// import package
import mongoose from "mongoose"

// import lib

const Schema = mongoose.Schema

const SiteSettingSchema = new Schema({
  adminSeqNo: {
    type: Number,
  }
  ,
  whatsappLink: {
    type: String,
    default: "",
  },
  telegramLink: {
    type: String,
    default: "",
  },
  faceBookLink: {
    type: String,
    default: "",
  },
  twitterLink: {
    type: String,
    default: "",
  },
  youtubeLink: {
    type: String,
    default: "",
  },
  instagramLink: {
    type: String,
    default: "",
  },
  tikTokLink: {
    type: String,
    default: "",
  },
  linkedinLink: {
    type: String,
    default: "",
  },
})

const SiteSetting = mongoose.model(
  "sitesetting",
  SiteSettingSchema,
  "sitesetting"
)
export default SiteSetting
