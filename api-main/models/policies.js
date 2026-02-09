import mongoose from "mongoose";

const PolicySchema = new mongoose.Schema({
    title: {
        type: String,
        default: ''
    },
    identifier: {
        type: String,
        default: ''
    },
    content: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        default: 'active'
    }
}, { timestamps: true })

const Policy = mongoose.model('policy', PolicySchema, 'policy')

export default Policy