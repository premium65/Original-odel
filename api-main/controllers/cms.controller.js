// import model
import { Cms } from "../models";
import {
  paginationQuery,
  filterQuery,
  filterProofQuery,
  columnFillter,
  filterSearchQuery,
} from "../lib/adminHelpers";
import isEmpty from "../lib/isEmpty";

/**
 * Get Cms List
 * URL : /adminapi/cms
 * METHOD : GET
 */
export const getCmsList = async (req, res) => {
  try {
    let pagination = paginationQuery(req.query);
    let filter = columnFillter(req.query, req.headers.timezone);
    let count = await Cms.countDocuments(filter);
    console.log("filterfilterfilter", count, filter);
    let data = await Cms.find(filter, {
      _id: 1,
      identifier: 1,
      title: 1,
      content: 1,
      status: 1,
      subject: 1,
    }).sort({ _id: -1 })
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

export const getSingleCms = async (req, res) => {
  console.log(req.params, "userrrrrrrrrrrrrrrrr");
  Cms.findOne({ _id: req.params.id }, (err, data) => {
    if (err) {
      return res
        .status(400)
        .json({ success: false, message: "Error on server" });
    }
    return res.status(200).json({ success: true, result: data });
  });
};

/**
 * Update Cms List
 * URL : /adminapi/cms
 * METHOD : PUT
 * BODY : id, identifier, title, content
 */
export const updateCms = async (req, res) => {
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

    let checkCmsData = await Cms.findOne({ _id: reqBody.id });
    if (!checkCmsData) {
      return res
        .status(400)
        .json({ status: false, message: "There Is No CMS" });
    }

    checkCmsData.identifier = reqBody.identifier;
    checkCmsData.title = reqBody.title;
    checkCmsData.status = reqBody.status;
    checkCmsData.content = reqBody.content;
    checkCmsData.type = reqBody.type;
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

/**
 * Add CMS Data
 * URL: /adminapi/cms
 * METHOD: POST
 * BODY: identifier, title, status, content
 */
export const addCms = async (req, res) => {
  try {
    let reqBody = req.body
    let errors = {};

    if (isEmpty(reqBody.identifier)) {
      errors.identifier = "Identifier is required";
    }
    if (isEmpty(reqBody.title)) {
      errors.title = "Title is required";
    }
    if (isEmpty(reqBody.content)) {
      errors.content = "Content is required";
    }
    if (isEmpty(reqBody.type) || !['help', 'about'].includes(reqBody.type)) {
      errors.content = "Type is invalid";
    }
    if (isEmpty(reqBody.status) || !['active', 'deactive'].includes(reqBody.status)){
      errors.status = "Invalid Status";
    }

    let checkIdentifier = await Cms.findOne({ identifier: new RegExp(reqBody.identifier) })
    if (!isEmpty(checkIdentifier)) {
      errors.identifier = "Identifier already exists"
    }

    if (!isEmpty(errors)) {
      return res.status(400).json({ success: false, errors })
    }

    const cmsData = new Cms({
      identifier: reqBody.identifier,
      title: reqBody.title,
      content: reqBody.content,
      status: reqBody.status,
      type: reqBody?.type || ""
    })

    await cmsData.save()

    return res.status(201).json({ success: true, message: 'Successfully created cms entry' })

  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, message: 'Something went wrong' })
  }
}


/**
 * Get CMS Page
 * URL : /api/cms/{{}}
 * METHOD : GET
 * PARAMS : identifier
 */
export const getCMSPage = (req, res) => {
  Cms.findOne(
    { identifier: req.params.identifier },
    {
      _id: 0,
      title: 1,
      content: 1,
    },
    (err, data) => {
      if (err) {
        return res
          .status(500)
          .json({ status: false, message: "Something went wrong" });
      }
      return res
        .status(200)
        .json({ status: true, message: "FETCH_SUCCESS", result: data });
    }
  );
};
export const getHomecms = async (req, res) => {

  try {
    var data = await Cms.find({ 'identifier': req.params.identifier })
    if (data) {
      return res
        .status(200)
        .json({ status: true, message: "FETCH_SUCCESS", result: data });

    }
    else {
      return res
        .status(200)
        .json({ status: false, message: "No data", });
    }
  }
  catch (err) {
    return res
      .status(500)
      .json({ status: false, message: "Something went wrong" });
  }

};
export const getCmsContent = async (req, res) => {

  try {
    var data = await Cms.find({ 'title': req.params.identifier })
    if (data) {
      return res
        .status(200)
        .json({ status: true, message: "FETCH_SUCCESS", result: data });

    }
    else {
      return res
        .status(200)
        .json({ status: false, message: "No data", });
    }
  }
  catch (err) {
    return res
      .status(500)
      .json({ status: false, message: "Something went wrong" });
  }

};

export const getTypeCms = async (req, res) => {
  try {

    const { params } = req

    let data = await Cms.find({ type: params.type })

    return res.status(200).json({ success: true, result: data, message: "FETCH_SUCCESS" })

  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, message: 'Something went wrong' })
  }
}