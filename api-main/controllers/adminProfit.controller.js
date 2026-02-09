import mongoose from "mongoose";
import { AdminProfit } from "../models";
import {
  paginationQuery,
  columnFillter,
  filterSearchQuery,
} from "../lib/adminHelpers";
import { IncCntObjId } from "../lib/generalFun";
import { momentFormat } from "../lib/dateTimeHelper";
import {convert} from "../lib/convert"
export const saveAdminprofit = async (reqBody) => {
  try {
    var saveAdminProfit = {
      userId: reqBody.userId,
      pair: reqBody.pair,
      coin: reqBody.coin,
      fee: reqBody.fee,
      ordertype: reqBody.ordertype,
      userCode:IncCntObjId(reqBody.userId)
    };
    let Profit = new AdminProfit(saveAdminProfit);
    await Profit.save();
    return { status: true };
  } catch (err) {
    return { status: true };
  }
};

export const profitHistory = async (req, res) => {
  try {
    let Export = req.query.export;
    const header = ["Date", "UserId",  "Pair","Currency", "Fee", "Type"];

    if (Export == "csv" || Export == "xls") {
      let type = {};
      let fillterQuery = columnFillter(req.query, req.headers.timezone);
      if (req.query.fillter != "" && req.query.fillter != undefined) {
        if (fillterQuery.createdAt) type["createdAt"] = fillterQuery.createdAt;
      }
      let exportData = await AdminProfit.find(fillterQuery, {
        userId: 1,
        coin: 1,
        userCode:1,
        fee: 1,
        createdAt: 1,
        pair: 1,
        ordertype: 1,
      }).sort({ createdAt: -1 });

      let csvData = [header];
      if (exportData && exportData.length > 0) {
        for (let item of exportData) {
          let arr = [];
          arr.push(
            momentFormat(String(item.createdAt), "DD-MM-YYYY h:mm A"),
            item.userCode,
            item.pair,
            item.coin,
            convert(item.fee),
            item.ordertype
          );
          csvData.push(arr);
        }
      }
      console.log(csvData);
      return res.csv(csvData);
    } else if (Export == "pdf") {
      let type = {};
      let fillterQuery = columnFillter(req.query, req.headers.timezone);
      if (req.query.fillter != "" && req.query.fillter != undefined) {
        if (fillterQuery.createdAt) type["createdAt"] = fillterQuery.createdAt;
        // console.log(type);
      }
      let Data = await AdminProfit.find(fillterQuery, {
        userId: 1,
        fee: 1,
        pair: 1,
        userCode:1,
        createdAt: 1,
        coin: 1,
        ordertype: 1,
      })
        .sort({ _id: -1 })
        .exec((err, data) => {
          if (err) {
            return res
              .status(500)
              .json({ success: false, message: "Something went wrong" });
          }
          let reqData = {
            pdfData: data,
          };
          return res
            .status(200)
            .json({ success: true, message: "FETCH", result: reqData });
        });
    } else {
      let pagination = paginationQuery(req.query);
      let filter = columnFillter(req.query, req.headers.timezone);

      let count = await AdminProfit.aggregate([
        {
          $lookup: {
            from: "user",
            localField: "userId",
            foreignField: "_id",
            as: "userinfo",
          },
        },
        {
          $unwind: {
            path: "$userinfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            tableId: 1,
            createdAt: 1,
            type: 1,
            markup: 1,
            userCode:1,
            fee: 1,
            email: "$userinfo.email",
            pair: 1,
            coin: 1,
            ordertype: 1,
            userId: 1,
          },
        },
        { $match: filter },
        { $sort: { _id: -1 } },
        
      ]);
      let data = await AdminProfit.aggregate([
        {
          $lookup: {
            from: "user",
            localField: "userId",
            foreignField: "_id",
            as: "userinfo",
          },
        },
        {
          $unwind: {
            path: "$userinfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            tableId: 1,
            createdAt: 1,
            type: 1,
            markup: 1,
            userCode:1,
            fee: 1,
            email: "$userinfo.email",
            pair: 1,
            coin: 1,
            ordertype: 1,
            userId: 1,
          },
        },
        { $match: filter },
        { $sort: { _id: -1 } },
        { $skip: pagination.skip },
        { $limit: pagination.limit },
      ]);
      console.log(data, "datadata");

      let result = {
        data,
        count: count.length,
      };
      return res.status(200).json({ success: true, data: result.data ,count:result.count });
    }
  } catch (err) {
    console.log("err: ", err);
    return res.status(500).json({ success: false, message: "Error on server" });
  }
};
