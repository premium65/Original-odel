// import package
import mongoose from "mongoose";
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const eventSchema = new Schema(
  {
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    deskView: {
      type: String,
      default: ''
    },
    mobileView: {
      type: String,
      default: ''
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("events", eventSchema, "events");

export default Event;
