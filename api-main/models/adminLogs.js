import mongoose from "mongoose"

const ObjectId = mongoose.Schema.Types.ObjectId

const AdminLogsSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
    },
    userCode: {
      type: String,
      required: true,
    },
    taskType: {
      type: String,
      required: true,
    },
    taskDescription: {
      type: String,
    },
    adminUserId: {
      type: ObjectId,
      required: true,
    },
    adminEmail: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

const adminLogs = mongoose.model("adminLogs", AdminLogsSchema, "adminLogs")

export default adminLogs
