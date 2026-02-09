import mongoose from 'mongoose';
const Schema = mongoose.Schema;

let contactSchema = new Schema({
    email: {
        type: String,
        index: true,
    },
    name: {
        type: String,
        index: true,
    },
    message: {
        type: String,
    },
    replyMessage: {
        type: String,
    },
    status: {
        type: String, default: "active"
    },
    replied: {
        type: Boolean, default: false
    },
    created_date: {
        type: Date, default: Date.now
    },
});

const contact = mongoose.model('contact', contactSchema, 'contact');
export default contact;