// import package
import mongoose from 'mongoose';

const Schema = mongoose.Schema;
let SliderSchema = new Schema({
    image: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const SliderManage = mongoose.model('slidermanage', SliderSchema, 'slidermanage');

export default SliderManage;