// import package
import mongoose from "mongoose";
const Schema = mongoose.Schema;

let packageSchema = new Schema(
  {
    type: {
      type: String,
    },
    price: {
      type: Number,
    },
    commissionFee: {
      type: Number,
    },
    taskCount: {
      type: Number,
    },
    uniqueBadgeNo: {
      type:Number
    },
    image: {
      type:String
    }
  },
  {
    timestamps: true,
  }
);

const Package = mongoose.model("package", packageSchema, "package");
export default Package;
