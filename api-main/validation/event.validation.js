import isEmpty from "../lib/isEmpty"


export const addEvent = async (req, res, next) => {
    try {
        
        const reqBody = req.body
        const errors = {}

        if (isEmpty(reqBody.title)) {
            errors.title = 'Title cannot be empty'
        }

        if (isEmpty(reqBody.description)) {
            errors.description = 'Description cannot be empty'
        }

        if (!isEmpty(errors)) {
            return res.json({ success: false, errors })
        } else {
            return next();
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'Something went wrong' })
    }
}