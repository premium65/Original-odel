// import package
import mongoose from "mongoose";
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

let bookingHistorySchema = new Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
      ref: "user",
    },
    type: {
      type: String,
      required: true,
    },
    balBefore: {
      type: String,
    },
    balAfter: {
      type: String,
        },
        amount: {
        type:Number
    },
    // totalBalBefore: {
    //   type: String,
    // },
    // totalBalAfter: {
    //   type: String,
    // },
    // totalCommissionBef: {
    //   type: Number,
    // },
    // totalCommissionAft: {
    //   type: Number,
    // },
    // pendingBalBef: {
    //   type: Number,
    // },
    // pendingBalAft: {
    //   type: Number,
    // },
    field: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const BookingHistory = mongoose.model(
  "bookingHistory",
  bookingHistorySchema,
  "bookingHistory"
);
export default BookingHistory;
