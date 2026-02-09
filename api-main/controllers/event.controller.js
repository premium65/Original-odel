import path from "path";
import { columnFillter, paginationQuery } from "../lib/adminHelpers";
import isEmpty from "../lib/isEmpty";
import Event from "../models/events";
import fs from 'fs'

export const getAllEvents = async (req, res) => {
  try {
    let pagination = paginationQuery(req.query);
    let filter = columnFillter(req.query, req.headers.timezone);
    let sortObj = await JSON.parse(req.query.sortObj);
    let sorts = isEmpty(sortObj) ? { _id: -1 } : sortObj;

    let data = await Event.find(filter)
      .sort(sorts)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean();
    let count = await Event.countDocuments(filter);

    return res.json({ success: true, result: { data, count } });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { body } = req;

    let event = new Event({
      title: body.title,
      description: body.description,
      deskView: isEmpty(req.files.deskView)
        ? ""
        : req.files.deskView[0].path.replace("public", ''),
      mobileView: isEmpty(req.files.mobileView)
        ? ""
        : req.files.mobileView[0].path.replace("public", ''),
    });

    await event.save();

    return res.json({ success: true, message: "Event added successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};


export const getSingleEvent = async (req, res) => {
    try {
        const { params } = req
        
        let data = await Event.findById(params.id).lean()
        
        return res.json({ success: true, result: data })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'Something went wrong' })
    }
}

export const updateEvent = async (req, res) => {
  try {
    
    const { body, files } = req

    let event = await Event.findById(body.id)

    if (!isEmpty(files)) {
      let unlinkable = Object.keys(files)
      for (let key of unlinkable){
        fs.unlink(path.join(__dirname, '../public', event[key]), (err) => console.log(err))
      }
    }

    event.title = body.title
    event.description = body.description
    event.deskView = files['deskView'] ? files['deskView'][0].path.replace('public', '') : event.deskView
    event.mobileView = files['mobileView'] ? files['mobileView'][0].path.replace('public', '') : event.mobileView

    await event.save()

    return res.json({ success: true, message: 'Updated Successfully' })

  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, message: 'Something went wrong' })
  }
}

export const deleteEvent = async (req, res) => {
  try {
    
    const { query } = req

    if (!query.id) {
      return res.status(400).json({ success: false, message: 'Invalid delete request' })
    }

    await Event.findByIdAndDelete(query.id)

    return res.json({ success: true, message: 'Event Deleted Successfully' })

  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, message: 'Something went wrong' })
  }
}

export const getBanners = async (req, res) => {
  try {
    
    let result = await Event.find({}).lean()

    return res.json({ success: true, result })

  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, message: 'Something went wrong' })
  }
}