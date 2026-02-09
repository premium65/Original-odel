// import model
import { FaqCategory, Faq } from "../models";

// import lib
import {
  paginationQuery,
  columnFillter,
  filterSearchQuery,
} from "../lib/adminHelpers";
import isEmpty from "../lib/isEmpty";

/**
 * Add Faq Category
 * URL : /adminapi/faqCategory
 * METHOD : POST
 * BODY : name
 */
export const addFaqCategory = async (req, res) => {
  try {
    let reqBody = req.body;
    let errors = {};
    if (isEmpty(reqBody.name)) {
      errors.name = "Category Name Is Required";
    }

    let regex = /^[A-Za-z0-9]*$/;
    var NumRegex = /^\d+$/;

    if (!regex.test(reqBody.name)) {
      errors.name = "Enter valid Category name";
    }

    if (NumRegex.test(reqBody.name)) {
      errors.name = "Enter valid Category name";
    }

    if (!isEmpty(errors)) {
      return res.status(400).json({ success: false, error: errors });
    }

    let checkDoc = await FaqCategory.findOne({ name: reqBody.name });
    if (checkDoc) {
      return res.status(400).json({
        success: false,
        error: { name: "Category Name Already Exists" },
      });
    }
    let newDoc = new FaqCategory({
      name: reqBody.name,
    });
    await newDoc.save();
    return res
      .status(200)
      .json({ success: true, message: "Added Successfully" });
  } catch (err) {
    console.log(
      "🚀 ~ file: faq.controller.js ~ line 37 ~ addFaqCategory ~ err",
      err
    );
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

/**
 * Update Faq Category
 * URL : /adminapi/faqCategory
 * METHOD : PUT
 * BODY : id, name, status
 */
export const updateFaqCategory = async (req, res) => {
  try {
    let reqBody = req.body;
    let errors = {};
    if (isEmpty(reqBody.name)) {
      errors.name = "Category Name Is Required";
    }

    let regex = /^[a-zA-Z ]*$/;
    if (!regex.test(reqBody.name)) {
      errors.name = "Enter valid Category name";
    }

    if (!isEmpty(errors)) {
      return res.status(400).json({ success: false, error: errors });
    }

    let checkDoc = await FaqCategory.findOne({
      name: reqBody.name,
      _id: { $ne: reqBody.id },
    });
    
    if (checkDoc) {
      return res
        .status(400)
        .json({ success: false, message: "Category Name Already Exists" });
    }
    await FaqCategory.updateOne(
      { _id: reqBody.id },
      {
        $set: {
          name: reqBody.name,
          status: reqBody.status,
        },
      }
    );

    return res
      .status(200)
      .json({ success: true, message: "Updated successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Something Went Wrong" });
  }
};

/**
 * Delete Faq Category
 * URL : /adminapi/faqCategory/{id}
 * METHOD : DELETE
 * PARAMS : id
 */
export const deleteFaqCategory = async (req, res) => {
  try {
    console.log(req.body, "body");
    let checkDoc = await FaqCategory.findOne({ _id: req.body.id });
    if (!checkDoc) {
      return res
        .status(400)
        .json({ success: false, message: "There Is No Record" });
    }

    await checkDoc.remove();

    return res
      .status(200)
      .json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Something Went Wrong" });
  }
};

export const getSingleFaqCategory = async (req, res) => {
  console.log(req.params, "userrrrrrrrrrrrrrrrr");
  FaqCategory.findOne({ _id: req.params.id }, (err, data) => {
    if (err) {
      return res
        .status(400)
        .json({ success: false, message: "Error on server" });
    }
    return res.status(200).json({ success: true, result: data });
  });
};

/**
 * Get Faq Category
 * URL : /adminapi/faqCategory
 * METHOD : GET
 */
export const listFaqCategory = async (req, res) => {
  try {
    let pagination = paginationQuery(req.query);
    let filter = columnFillter(req.query, req.headers.timezone);
    let sort = await JSON.parse(req.query.sortObj)
    let count = await FaqCategory.countDocuments(filter);
    let data = await FaqCategory.find(filter, {
      name: 1,
      status: 1,
    })
      .sort(sort)
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

export const getHelp = async (req, res) => {
  try {
    // let pagination = paginationQuery(req.query);
    // let filter = columnFillter(req.query, req.headers.timezone);
    // let sort = await JSON.parse(req.query.sortObj);
    let count = await Faq.countDocuments({status:"active"});
    let data = await Faq.find({status:"active"}, {
      name: 1,
      status: 1,
      question:1,
      answer:1,
    })
      // .sort(sort)
      // .skip(pagination.skip)
      // .limit(pagination.limit);

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
/**
 * Get Faq Category
 * URL : /adminapi/faqCategory
 * METHOD : GET
 */
export const getFaqCategory = async (req, res) => {
  FaqCategory.find({ status: "active" }, { name: 1 }, (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Something went wrong" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Fetch success", result: data });
  });
};

/**
 * Add Faq
 * URL : /adminapi/faq
 * METHOD : POST
 * BODY : categoryId, question, answer
 */
export const addFaq = async (req, res) => {
  try {
    let reqBody = req.body;
    let errors = {};
    // if (isEmpty(reqBody.categoryId)) {
    //   errors.categoryId = "Category field is required";
    // }
    if (isEmpty(reqBody.question)) {
      errors.question = "Question field is required";
    }
    if (isEmpty(reqBody.answer)) {
      errors.answer = "Answer field is required";
    }
    if (isEmpty(reqBody.status)) {
      errors.status = "Status field is required";
    }
    if (!isEmpty(errors)) {
      return res.status(400).json({ success: false, error: errors });
    }

    // let checkCategory = await FaqCategory.findOne({ _id: reqBody.categoryId });
    // if (!checkCategory) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "There is no category" });
    // }

    let newDoc = new Faq({
      // categoryId: reqBody.categoryId,
      question: reqBody.question,
      answer: reqBody.answer,
      status: reqBody.status,
    });
    await newDoc.save();
    return res
      .status(200)
      .json({ success: true, message: "Added successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

/**
 * Update Faq Category
 * URL : /adminapi/faq
 * METHOD : PUT
 * BODY : id, categoryId, question, answer, status
 */
export const updateFaq = async (req, res) => {
  try {
    let reqBody = req.body;
    let errors = {};
    // if (isEmpty(reqBody.categoryId)) {
    //   errors.categoryId = "Category field is required";
    // }
    if (isEmpty(reqBody.question)) {
      errors.question = "Question field is required";
    }
    if (isEmpty(reqBody.answer)) {
      errors.answer = "Answer field is required";
    }
    if (!isEmpty(errors)) {
      return res.status(400).json({ success: false, error: errors });
    }

    // let checkCategory = await FaqCategory.findOne({ _id: reqBody.categoryId });
    // if (!checkCategory) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "There is no category" });
    // }

    await Faq.updateOne(
      { _id: reqBody.id },
      {
        $set: {
          // categoryId: reqBody.categoryId,
          question: reqBody.question,
          answer: reqBody.answer,
          status: reqBody.status,
        },
      }
    );

    return res
      .status(200)
      .json({ success: true, message: "Updated successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const getSingleFaq = async (req, res) => {
  console.log(req.params, "userrrrrrrrrrrrrrrrr");
  Faq.findOne({ _id: req.params.id }, (err, data) => {
    if (err) {
      return res
        .status(400)
        .json({ success: false, message: "Error on server" });
    }
    return res.status(200).json({ success: true, result: data });
  });
};

/**
 * Delete Faq
 * URL : /adminapi/faq/{id}
 * METHOD : DELETE
 * PARAMS : id
 */
export const deleteFaq = async (req, res) => {
  try {
    console.log(req.params, "params");
    console.log(req.body, "body");

    let checkDoc = await Faq.findOne({ _id: req.body.id });
    if (!checkDoc) {
      return res
        .status(400)
        .json({ success: false, message: "There is no record" });
    }

    await checkDoc.remove();

    return res
      .status(200)
      .json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    console.log(err, "error");
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

/**
 * Get Faq
 * URL : /adminapi/faq
 * METHOD : GET
 */
export const listFaq = async (req, res) => {
  try {
    let pagination = paginationQuery(req.query);
    // let filter = filterSearchQuery(req.query, [
    //   "categoryInfo.name",
    //   "question",
    //   "status",
    // ]);
    let filter = columnFillter(req.query, req.headers.timezone);
    let sort = await JSON.parse(req.query.sortObj);
    if (isEmpty(sort)){
      sort._id = -1
    }
    let count = await Faq.countDocuments(filter);
    // let data = await Faq.aggregate([
    //   {
    //     $lookup: {
    //       from: "faqcategory",
    //       localField: "categoryId",
    //       foreignField: "_id",
    //       as: "categoryInfo",
    //     },
    //   },
    //   { $unwind: "$categoryInfo" },
    //   {
    //     $project: {
    //       categoryId: 1,
    //       categoryName: "$categoryInfo.name",
    //       question: 1,
    //       answer: 1,
    //       status: 1,
    //     },
    //   },
    //   { $sort: sort },
    //   { $skip: pagination.skip },
    //   { $limit: pagination.limit },
    //   { $match: filter },
    // ]);
    let data = await Faq.find({})
    let result = {
      count,
      data,
    };
    return res
      .status(200)
      .json({ success: true, message: "Fetched successfully.", result });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: true, message: "Something went wrong." });
  }
};

/**
 * Get All Faq with Category
 * URL : /api/faq
 * METHOD : GET
 */
export const getFaqWithCategory = (_req, res) => {
  Faq.aggregate(
    [
      { $match: { status: "active" } },
      {
        $group: {
          _id: "$categoryId",
          categoryDetails: {
            $push: {
              question: "$question",
              answer: "$answer",
            },
          },
        },
      },
      {
        $lookup: {
          from: "faqcategory",
          localField: "_id",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" },
      {
        $project: {
          categoryName: "$categoryInfo.name",
          categoryDetails: 1,
        },
      },
    ],
    (err, data) => {
      if (err) {
        return res
          .status(500)
          .json({ success: true, message: "Something went wrong." });
      }
      return res.status(200).json({
        success: true,
        message: "Fetched successfully.",
        result: data,
      });
    }
  );
};
