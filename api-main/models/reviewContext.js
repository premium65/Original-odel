import mongoose from "mongoose";

const ReviewContextSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "address",
    enum: ["address", "landmark"],
  },
  value: {
    type: String,
    required: true,
  },
});

const ReviewContext = mongoose.model(
  "reviewContext",
  ReviewContextSchema,
  "reviewContext"
);
export default ReviewContext;
