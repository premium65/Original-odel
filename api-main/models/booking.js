// import package
import mongoose from "mongoose";
const Schema = mongoose.Schema;

let bookingSchema = new Schema(
  {
    commissionFee: {
      type: Number,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    locationImage: {
      type: String,
    },
    landScapeImage: {
      type: String,
    },
    hotelImages: {
      type: Array,
      default: [],
    },
    count: {
      type: Number,
      default:0
    },
    // status: {
    //   type: String,
    //   enum: ["active", "deactive"],
    //   default: "active", //active, deactive
    // },
    taskNo: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("booking", bookingSchema, "booking");
export default Booking;
