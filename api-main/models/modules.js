import mongoose from 'mongoose';
const Schema = mongoose.Schema;

let ModuleSchema = new Schema({
  pagename: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "deactive"],
  },
});

const Modules = mongoose.model("modules", ModuleSchema, "modules");
export default Modules;