import { columnFillter, paginationQuery } from "../lib/adminHelpers";
import isEmpty from "../lib/isEmpty";
import Policy from "../models/policies";


export const getPolicyList = async (req, res) => {
    try {
      let pagination = paginationQuery(req.query);
      let filter = columnFillter(req.query, req.headers.timezone);
      let count = await Policy.countDocuments(filter);
      console.log("filterfilterfilter", count, filter);
      let data = await Policy.find(filter).sort({ _id: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit);
  
      let result = {
        count,
        data,
      };
      return res
        .status(200)
        .json({ success: true, message: "Fetched successfully", result });
    } catch (err) {
      console.log(err, "error");
      return res
        .status(500)
        .json({ success: true, message: "Something went wrong" });
    }
  };

export const getSinglePolicy = async (req, res) => {
    console.log(req.params, "userrrrrrrrrrrrrrrrr");
    Policy.findOne({ _id: req.params.id }, (err, data) => {
      if (err) {
        return res
          .status(400)
          .json({ success: false, message: "Error on server" });
      }
      return res.status(200).json({ success: true, result: data });
    });
  };

export const updatePolicy = async (req, res) => {
    try {
      let reqBody = req.body;
      let errors = {};
      if (reqBody.title == "") {
        errors.title = "Title Field Is Required";
      }
      if (reqBody.content == "") {
        errors.content = "Content Field Is Required";
      }
      if (!isEmpty(errors)) {
        return res.status(400).json({ status: false, error: errors });
      }
  
      let checkCmsData = await Policy.findOne({ _id: reqBody.id });
      if (!checkCmsData) {
        return res
          .status(400)
          .json({ status: false, message: "There Is No CMS" });
      }
  
      checkCmsData.identifier = reqBody.identifier;
      checkCmsData.title = reqBody.title;
      checkCmsData.status = reqBody.status;
      checkCmsData.content = reqBody.content;
      await checkCmsData.save();
      return res
        .status(200)
        .json({ success: true, message: "CMS updated successfully" });
    } catch (err) {
      console.log(
        "🚀 ~ file: cms.controller.js ~ line 52 ~ updateCms ~ err",
        err
      );
      return res
        .status(500)
        .json({ status: false, message: "Something went wrong" });
    }
  };

export const getPolicy = async (req, res) => {
    try {
        
        const { params } = req

        let data = await Policy.findOne({ identifier: params.id })

        return res.json({ success: true, result: data })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'Something went wrong' })
    }
}