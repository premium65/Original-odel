// import package
import mongoose from 'mongoose';

// import helpers
import isEmpty from '../lib/isEmpty';


/** 
 * Anouncement Add
 * URL: /adminApi/anouncement
 * METHOD : POST
 * BODY : endDate,content
*/
export const anouncementAdd = (req, res, next) => {
    let errors = {}, reqBody = req.body, TodayDate = new Date();

    if (isEmpty(reqBody.endDate)) {
        errors.endDate = "endDate field is required";
    } else if (new Date(reqBody.endDate) < TodayDate) {
        errors.endDate = 'End Date is less then Now Date'
    }
    if (isEmpty(reqBody.content)) {
        errors.content = "content field is required";
    } else if (reqBody.content.length >= 150) {
        errors.content = "Only Allow 150 charactors";

    }

    if (!isEmpty(errors)) {
        return res.status(400).json({ "errors": errors })
    }

    return next();
}