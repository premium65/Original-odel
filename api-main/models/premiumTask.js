// import package
import mongoose from "mongoose"
import config from "../config"
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId
function getRandomHotelName() {
  const HOTEL_NAMES = config.PREMIUM_TASK.HOTEL_NAMES
  const randomIndex = Math.floor(Math.random() * HOTEL_NAMES.length)
  return HOTEL_NAMES[randomIndex]
}

const premiumSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
      ref: "user",
    },
    name: {
      type: String,
      // required: true,
      default: getRandomHotelName(),
    },
    description: {
      type: String,
      // required: true,
      default: config.PREMIUM_TASK.DESCRIPTION,
    },
    locationImage: {
      type: String,
      default: config.PREMIUM_TASK.LOCATION_IMAGE,
    },
    landScapeImage: {
      type: String,
      default: config.PREMIUM_TASK.LANDSCAPE_IMAGE,
    },
    hotelImages: {
      type: Array,
      default: config.PREMIUM_TASK.HOTEL_IMAGES,
    },
    commissionFee: {
      type: Number,
    },
    taskNo: {
      type: Number,
      default: "",
    },
    // type: {
    //   type: String,
    // },
    status: {
      type: String,
      default: "new",
    },
    amount: {
      type: Number,
    },
    // uniqueBadgeNo: {
    //   type: Number,
    // },
  },
  {
    timestamps: true,
  }
)

const premiumTask = mongoose.model("premiumTask", premiumSchema, "premiumTask")

export default premiumTask
