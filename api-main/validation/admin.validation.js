// import package

// import helpers
import isEmpty from "../lib/isEmpty";

/**
 * Admin Login
 * URL : /admin/login
 * METHOD: POST
 * BODY : email, password
 */
export const loginValidate = (req, res, next) => {
  let errors = {},
    reqBody = req.body;
  let emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,6}))$/;

  if (isEmpty(reqBody.email)) {
    errors.email = "Email field is required";
  } else if (!emailRegex.test(reqBody.email)) {
    errors.email = "Email is invalid";
  }
  if (isEmpty(reqBody.password)) {
    errors.password = "Password field is required";
  }
  if (!isEmpty(errors)) {
    return res.status(400).json({ errors: errors });
  }

  return next();
};

export const addIpAddress = (req, res, next) => {
  try {
    let errors = {};

    let reqBody = req.body;
    if (isEmpty(reqBody.ipAddress)) {
      errors.ipAddress = "IP Address Field Is Required";
    }

    if (!isEmpty(errors)) {
      console.log("....errors", errors);

      return res.status(400).json({ success: false, errors: errors });
    }
    return next();
  } catch (err) {
    console.log(err, "err");
    return res
      .status(500)
      .json({ success: false, message: "something went wrong" });
  }
};

/**
 * Change Profile
 * METHOD : put
 * URL : /api/updateProfile
 * BODY : email,phoneNumber,name
 */
export const updateProfile = (req, res, next) => {
  let errors = {},
    reqBody = req.body;
  let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  let mobileRegex = /^\d{10}$/;

  let letterRex = /^[a-zA-Z-,]+(\s{0,1}[a-zA-Z-, ])*$/;
  if (isEmpty(reqBody.name)) {
    errors.name = "Name field is required";
  } else if (!letterRex.test(reqBody.name)) {
    errors.name = "Only allow characters";
  } else if (reqBody.name.length >= 15) {
    errors.name = "Minimum 15 characters ";
  }

  if (isEmpty(reqBody.email)) {
    errors.email = "Email field is required";
  } else if (!emailRegex.test(reqBody.email)) {
    errors.email = "Email is invalid";
  }
  if (isEmpty(reqBody.phoneNumber)) {
    errors.phoneNumber = "PhoneNumber field is required";
  } else if (!mobileRegex.test(reqBody.phoneNumber)) {
    errors.phoneNumber = "Phonenumber is invalid";
  }

  if (!isEmpty(errors)) {
    return res.status(400).json({ errors: errors });
  }

  return next();
};
/**
 * Change Password
 * METHOD : POST
 * URL : /api/changePassword
 * BODY : newPassword, confirmPassword, oldPassword
 */
export const changePassword = (req, res, next) => {
  let errors = {},
    reqBody = req.body,
    passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{6,18}/g;

  // if (isEmpty(reqBody.confirmPassword)) {
  //     errors.confirmPassword = "Old Password field is required";
  // }
  if (isEmpty(reqBody.oldPassword)) {
    errors.oldPassword = "Old Password field is required";
  }
  if (isEmpty(reqBody.newPassword)) {
    errors.newPassword = "New Password field is required";
  } else if (!passwordRegex.test(reqBody.newPassword)) {
    errors.newPassword =
      "Password should contain atleast one uppercase, Atleast one lowercase, Atleast one number, Atleast one special character and Minimum 6 and Maximum 18";
  } else if (reqBody.newPassword.length > 18) {
    errors.newPassword =
      "Password should contain atleast one uppercase, Atleast one lowercase, Atleast one number, Atleast one special character and Minimum 6 and Maximum 18";
  } else if (!(reqBody.newPassword == reqBody.confirmPassword)) {
    errors.confirmPassword = "Password doesn't match";
  }

  if (isEmpty(reqBody.confirmPassword)) {
    errors.confirmPassword = "Confirm Password field is required";
  }
   if (reqBody.newPassword != reqBody.confirmPassword) {
      errors.confirmPassword = "Passwords must match";
  }
  if ((reqBody.newPaasword || reqBody.confirmPassword)==reqBody.oldPassword) {
    errors.confirmPassword = "Old Password and New Password must not be same";
}
  // if (!isEmpty(reqBody.newPaasword) && !isEmpty(reqBody.confirmPassword) && reqBody.newPaasword != reqBody.confirmPassword) {
  //     errors.confirmPassword = "Passwords must match";
  // }

  if (!isEmpty(errors)) {
    return res.status(400).json({ errors: errors });
  }

  return next();
};

export const SubAdminValid = (req, res, next) => {
  try {
    let errors = {};
    let NameRegex = /^[a-zA-Z0-9]*$/;
    let emailRegex =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,6}))$/;
    let passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{6,18}(?!\S)/;
    let reqBody = req.body;

    if (isEmpty(reqBody.name)) {
      errors.name = "Name Is Required";
    } else if (!NameRegex.test(reqBody.name)) {
      errors.name = "Enter valid name";
    }

    if (isEmpty(reqBody.email)) {
      errors.email = "Email Is Required";
    } else if (!emailRegex.test(reqBody.email)) {
      errors.email = "Invalid Email";
    }

    if (isEmpty(reqBody.role)) {
      errors.role = "Role Is Required";
    }

    // if (isEmpty(reqBody.password)) {
    //   errors.password = "Password Is Required";
    // }
    if (isEmpty(reqBody.password)) {
      errors.password = "Password Is Required";
    } else if (reqBody.password.length > 18) {
      errors.password = "Password Must Not Be Greater Than 18 Characters";
    } else if (reqBody.password.length < 6) {
      errors.password = "Password Must Not Be Less Than 6 Characters";
    } else if (!passwordRegex.test(reqBody.password)) {
      errors.password =
        "Password must contain Atleast One Special character,Lowercase,Uppercase & Number Value";
    }

    if (!isEmpty(errors)) {
      return res.status(400).json({ status: false, error: errors });
    }
    return next();
  } catch (err) {
    console.log(
      "🚀 ~ file: admin.validation.js ~ line 259 ~ SubAdminValid ~ err",
      err
    );
    return res
      .status(500)
      .json({ status: false, message: "Something went wrong" });
  }
};

export const updateAdminValid = (req, res, next) => {
  try {
    let errors = {};
    let emailRegex =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,6}))$/;

    let reqBody = req.body;

    if (isEmpty(reqBody.name)) {
      errors.name = "Name Is Required";
    }

    // if (isEmpty(reqBody.restriction)) {
    //     errors.restriction = 'Required'
    // }

    if (isEmpty(reqBody.email)) {
      errors.email = "Email Is Required";
    } else if (!emailRegex.test(reqBody.email)) {
      errors.email = "Invalid Email";
    }
    if (!isEmpty(errors)) {
      return res.status(400).json({ status: false, error: errors });
    }
    return next();
  } catch (err) {
    console.log(err, "err");
    return res
      .status(500)
      .json({ status: false, message: "Something went wrong" });
  }
};

export const ModuleValid = (req, res, next) => {
  let errors = {};

  let reqBody = req.body;
  if (isEmpty(reqBody.pagename)) {
    errors.pagename = "PageName Is Required";
  }
  if (isEmpty(reqBody.status)) {
    errors.status = "Status Is Required";
  }

  if (!isEmpty(errors)) {
    return res.status(400).json({ success: false, error: errors });
  }
  return next();
};

export const SubModuleValid = (req, res, next) => {
  let errors = {};
  let reqBody = req.body;
  if (isEmpty(reqBody.mainmodule)) {
    errors.mainmodule = "Mainmodule Is Required";
  }
  if (isEmpty(reqBody.subModule)) {
    errors.subModule = "Submodule Is  Required";
  }
  if (isEmpty(reqBody.status)) {
    errors.status = "Status Is Required";
  }

  if (!isEmpty(errors)) {
    return res.status(400).json({ success: false, error: errors });
  }
  return next();
};

export const RoleValidation = (req, res, next) => {
  let reqBody = req.body,
    errors = {};
  if (isEmpty(reqBody.restriction)) {
    errors.restriction = "Restriction Is Required";
  }
  if (!isEmpty(errors)) {
    return res.status(400).json({ success: false, error: errors });
  }
  return next();
};

/**
 * Update 2FA Code
 * METHOD : PUT
 * URL : /api/security/2fa
 * BODY : code, secret, uri
 */
export const update2faValid = (req, res, next) => {
  let errors = {};
  let reqBody = req.body;

  if (isEmpty(reqBody.code)) {
    errors.code = "Code Required";
  } else if (isNaN(reqBody.code) || reqBody.code.length > 6) {
    errors.code = "Invalid Code";
  }

  if (isEmpty(reqBody.secret)) {
    errors.secret = "Code Required";
  }

  if (isEmpty(reqBody.uri)) {
    errors.uri = "Code Required";
  }

  if (!isEmpty(errors)) {
    return res.status(400).json({ errors: errors });
  }

  return next();
};

export const forgetPassword = (req, res, next) => {
  let errors = {},
    reqBody = req.body,
    emailRegex =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,6}))$/;


    if (isEmpty(reqBody.email)) {
      errors.email = "Please enter your email";
    } else if (!emailRegex.test(reqBody.email)) {
      errors.email = "Please enter valid email address";
    }
 
  
  if (!isEmpty(errors)) {
    return res.status(400).json({ "errors": errors })
  }
  return next();
};
export const confirmMailValidate = (req, res, next) => {
  let errors = {},
    reqBody = req.body;

  if (isEmpty(reqBody.authToken)) {
    errors.authToken = "authToken field is required";
  }

  if (!isEmpty(errors)) {
    return res.status(400).json({ errors: errors });
  }

  return next();
};

export const resetPassword = (req, res, next) => {
  let errors = {},
    reqBody = req.body,
    passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{6,18}/g;

  if (isEmpty(reqBody.authToken)) {
    errors.authToken = "authToken field is required";
  }

  if (isEmpty(reqBody.password)) {
    errors.password = "Password field is required";
  } else if (!passwordRegex.test(reqBody.password)) {
    errors.password =
      "Password should contain atleast one uppercase, atleast one lowercase, atleast one number, atleast one special character and minimum 6 and maximum 18";
  } else if (reqBody.password.length > 18) {
    errors.password =
      "Password should contain atleast one uppercase, atleast one lowercase, atleast one number, atleast one special character and minimum 6 and maximum 18";
  }

  if (isEmpty(reqBody.confirmPassword)) {
    errors.confirmPassword = "Confirm password field is required";
  } else if (
    !isEmpty(reqBody.password) &&
    !isEmpty(reqBody.confirmPassword) &&
    reqBody.password != reqBody.confirmPassword
  ) {
    errors.confirmPassword = "Passwords must match";
  }

  if (!isEmpty(errors)) {
    return res.status(400).json({ errors: errors });
  }

  return next();
};

export const putRefferalSetting = (req, res, next) => {
    const { body } = req
    const errors = {}

    if(isEmpty(body.currencyId)){
      errors.currencyId = "Currency ID cannot be empty"
    } else if (body.currencyId.length !== 24){
      errors.currencyId = "Please Select Currency"
    }

    if(isEmpty(body.percentage)){
      errors.percentage = "Percentage cannot be empty"
    } else if (isNaN(body.percentage)){
      errors.percentage = "Invalid percentage value"
    }
    else if (parseFloat(body.percentage) <= 0) {
      errors.percentage = "Only allow positive numeric value";
  }
    // if(isEmpty(body.status)){
    //   errors.status = "Status cannot be empty"
    // }

    if(!isEmpty(errors)){
      return res.status(400).json({errors, message: 'Invalid data'})
    }

    return next()

}