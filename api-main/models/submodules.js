// import package
import mongoose from "mongoose";

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

let SubModule = new Schema({
  mainmoduleId: {
    type: ObjectId,
    required: true,
  },
  subModule: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "deactive"],
  },
});

const SubModules = mongoose.model("subModule", SubModule, "subModule");
export default SubModules;