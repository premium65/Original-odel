//import model
import { Smslog } from "../models"
import { paginationQuery, columnFillter } from "../lib/adminHelpers"

//import lib
import isEmpty from "../lib/isEmpty";

export const getsmslog = async (req, res) => {
    try {
        let pagination = paginationQuery(req.query);
        let filter = columnFillter(req.query, req.headers.timezone);
        let sortObj = !isEmpty(JSON.parse(req.query.sortObj)) ? JSON.parse(req.query.sortObj) : { _id: -1 };
        let count = await Smslog.countDocuments(filter);
        let data = await Smslog.find(filter, { phoneCode: 1, phoneNo: 1, userId: 1 })
            .skip(pagination.skip)
            .limit(pagination.limit);
        let result = {
            count,
            data
        };
        return res.status(200).json({ success: true, messages: "success", result });
    } catch (err) {
        console.log(err, 'ew')
    }
};