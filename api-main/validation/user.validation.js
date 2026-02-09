// import package
import mongoose from "mongoose";

// import lib
import isEmpty, { isBoolean } from "../lib/isEmpty";
import { decryptObject } from "../lib/cryptoJS";

/**
 * Create New User Validataion
 * URL: /api/register
 * METHOD : POST
 * BODY : email, password, confirmPassword, reCaptcha, isTerms
 */
export const registerValidate = (req, res, next) => {
  let errors = {},
    reqBody = req.body;
  console.log("RQBODY",reqBody)
  let usernameRegex = /^[a-zA-Z0-9_.]+$/;
  let numberRegex = /^(?:\+91|0)?[6789]\d{9}$|^\d{3,5}[-\s]\d{6,8}$/;
  let passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{6,18}/g;
  let emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,6}))$/;

    // if (isEmpty(reqBody.email)) {
    //   errors.email = "Email field is required";
    // } else if (!emailRegex.test(reqBody.email)) {
    //   errors.email = "Email is invalid";
  // }
    if (isEmpty(reqBody.username)) {
      errors.username = "Please enter your user name";
    } else if (!usernameRegex.test(reqBody.username)) {
      errors.username = "Username contains invalid characters"
    }
    if (isEmpty(reqBody.phoneNo)) {
      errors.phoneNo = "Please enter your Mobile number";
    } else if (!numberRegex.test(reqBody.phoneNo)) {
      errors.phoneNo = "Phone number contains invalid characters"
    }
    if (isEmpty(reqBody.password)) {
      errors.password = "Password field is required";
    } else if (!passwordRegex.test(reqBody.password)) {
      errors.password = "Password should contain atleast one uppercase, lowercase, symbol and number with 6 to 18 characters in length"
    }
    if (!reqBody.isTerms) {
      errors.isTerms = "Please accept terms and conditions";
    }
    if (isEmpty(reqBody.confirmPassword)) {
      errors.confirmPassword = "Confirm password field is required";
    }
    if (!isEmpty(reqBody.password) && !isEmpty(reqBody.confirmPassword) && reqBody.password != reqBody.confirmPassword) {
      errors.confirmPassword = "Passwords must match";
    }

    // if (isEmpty(reqBody.inviteCode)) {
    //   errors.inviteCode = "Invitation Code Required";
    // }

    // if (isEmpty(reqBody.reCaptcha)) {
    //   errors.reCaptcha = "ReCAPTCHA field is required";
    // }


    if (!isEmpty(errors)) {
      return res.status(400).json({ "errors": errors })
    }



  return next();
};

/**
 * Verifiy OTP
 * METHOD : POST
 * URL : /api/verifyOtp
 * BODY : optAuth, otp
 */
export const verifyOtpValidation = (req, res, next) => {
  let errors = {},
    reqBody = req.body;
  if (isEmpty(reqBody.otpAuth)) {
    errors.otp = "Auth field is required";
  }

  if (isEmpty(reqBody.otp)) {
    errors.otp = "Verification Code field is required";
  } else if (isNaN(reqBody.otp)) {
    errors.otp = "Only allow number";
  } else if (reqBody.otp.toString().length != 6) {
    errors.otp = "Invalid Verification Code";
  }

  if (!isEmpty(errors)) {
    return res.status(400).json({ errors: errors });
  }

  return next();
};

/**
 * User Login
 * METHOD : POST
 * URL : /api/login
 * BODY : email, password, isTerms, loginHistory
 */
export const loginValidate = (req, res, next) => {
  let errors = {},
    reqBody = req.body;


    if (isEmpty(reqBody.countryCode)) {
      errors.countryCode = "Please select your country code ";
    }
    if (isEmpty(reqBody.phoneNo)) {
      errors.phoneNo = "Please enter your Mobile number";
    }
  if (isEmpty(reqBody.password)) {
    errors.password = "Password is required";
  }

  if (!isEmpty(errors)) {
    return res.status(400).json({ "errors": errors })
  }

  return next();
};

/**
 * Email Verification
 * METHOD : POST
 * URL : /api/confirm-mail
 * BODY : userId
 */
export const confirmMailValidate = (req, res, next) => {
  let errors = {},
    reqBody = req.body;

  if (isEmpty(reqBody.authToken)) {
    errors.authToken = "AuthToken field is required";
  }

  if (!isEmpty(errors)) {
    return res.status(400).json({ errors: errors });
  }

  return next();
};
export const activateRegsiterUser = (req, res, next) => {
  let errors = {},
    reqBody = req.body;

  if (isEmpty(reqBody.userId)) {
    errors.userId = "AuthToken field is required";
  }

  if (!isEmpty(errors)) {
    return res.status(400).json({ errors: errors });
  }

  return next();
};

/**
 * Edit User Profile
 * METHOD : PUT
 * URL : /api/userProfile
 * BODY : firstName,lastName,blockNo,address,country,state,city,postalCode
 */
export const editProfileValidate = (req, res, next) => {
  let errors = {},
    reqBody = req.body;

  if (isEmpty(reqBody.firstName)) {
    errors.firstName = "Enter your firstName";
  }

  if (isEmpty(reqBody.lastName)) {
    errors.lastName = "Enter your LastName";
  }


  if (isEmpty(reqBody.address)) {
    errors.address = "Enter your Address";
  }

  if (isEmpty(reqBody.country)) {
    errors.country = "Please select one country";
  }


  if (isEmpty(reqBody.city)) {
    errors.city = "Please select one city";
  }

  if (isEmpty(reqBody.postalCode)) {
    errors.postalCode = "Enter your Postalcode";
  }

  if (!isEmpty(errors)) {
    return res.status(400).json({ errors: errors });
  }

  return next();
};

/**
 * Update Bank Detail
 * METHOD : POST
 * URL : /api/bankdetail
 * BODY : bankId, bankName,accountNo,holderName,bankcode,country,city,bankAddress,currencyId,currencySymbol
 */
export const editBankValidate = (req, res, next) => {
  let errors = {},
    reqBody = req.body;
  console.log(reqBody, "reqBodyreqBodyreqBodyreqBody")
  console.log(reqBody.bankcode > 0, "reqBody.bankcode > 0")
  console.log(reqBody.accountNo > 0, "reqBody.accountNo > 0")
  if (isEmpty(reqBody.bankName)) {
    errors.bankName = "REQUIRED";
  }

  if (isEmpty(reqBody.accountNo)) {
    errors.accountNo = "REQUIRED";
  } else if (!(reqBody.accountNo > 0)) {
    errors.accountNo = "Invalid Account Number";
  } else if (reqBody.accountNo == 0) {
    errors.accountNo = "Invalid Account Number";
  }

  if (isEmpty(reqBody.holderName)) {
    errors.holderName = "REQUIRED";
  }

  if (isEmpty(reqBody.bankcode)) {
    errors.bankcode = "REQUIRED";
  } else if (reqBody.bankcode == 0) {
    errors.bankcode = "Invalid Bank Code";
  }

  if (isEmpty(reqBody.country)) {
    errors.country = "REQUIRED";
  }

  if (isEmpty(reqBody.city)) {
    errors.city = "REQUIRED";
  }

  if (isEmpty(reqBody.bankAddress)) {
    errors.bankAddress = "REQUIRED";
  }

  if (isEmpty(reqBody.currencyId)) {
    errors.currencyId = "REQUIRED";
  }

  if (isEmpty(reqBody.currencyId)) {
    errors.currencyId = "REQUIRED";
  } else if (!mongoose.Types.ObjectId.isValid(reqBody.currencyId)) {
    errors.currencyId = "Invalid Currency";
  }
  console.log(errors, "errorserrorserrors")
  if (!isEmpty(errors)) {
    return res.status(400).json({ errors: errors });
  }

  return next();
};

/**
 * Delete Bank Detail
 * METHOD : PUT
 * URL : /api/bankdetail
 * BODY : bankId
 */
export const deleteBankValidate = (req, res, next) => {
  let errors = {},
    reqBody = req.body;

  if (isEmpty(reqBody.bankId)) {
    errors.bankId = "REQUIRED";
  } else if (!mongoose.Types.ObjectId.isValid(reqBody.bankId)) {
    errors.bankId = "Invalid bank id";
  }

  if (!isEmpty(errors)) {
    return res.status(400).json({ errors: errors });
  }

  return next();
};

/**
 * Change New Password
 * METHOD : POST
 * URL : /api/changePassword
 * BODY : password, confirmPassword, oldPassword
 */
export const changePwdValidate =async (req, res, next) => {
  let errors = {};
  let reqBody = req.body;
  console.log("REQBODY", reqBody);
  reqBody =await decryptObject(reqBody.id)
  console.log("REQBODY",reqBody)
  let passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{6,18}/g;

  if (isEmpty(reqBody.oldPassword)) {
    errors.oldPassword = "Current password is required";
  }

  if (isEmpty(reqBody.password)) {
    errors.password = "New password is required";
  } else if (!passwordRegex.test(reqBody.password)) {
    errors.password = "Password should contain atleast one uppercase, lowercase, a symbol and number with 6 to 18 charaters in length";
  }

  if (isEmpty(reqBody.confirmPassword)) {
    errors.confirmPassword = "Confirm password required";
  } else if (
    !isEmpty(reqBody.password) &&
    !isEmpty(reqBody.confirmPassword) &&
    reqBody.password != reqBody.confirmPassword
  ) {
    errors.password = "Passwords mismatch";
    errors.confirmPassword = "Passwords mismatch";
  }

  if (!isEmpty(errors)) {
    return res.status(400).json({ errors: errors });
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
    errors.code = "REQUIRED";
  } else if (isNaN(reqBody.code) || reqBody.code.length > 6) {
    errors.code = "Invalid 2FA code";
  }

  if (isEmpty(reqBody.secret)) {
    errors.secret = "REQUIRED";
  }

  if (isEmpty(reqBody.uri)) {
    errors.uri = "REQUIRED";
  }

  if (!isEmpty(errors)) {
    return res.status(400).json({ errors: errors });
  }

  return next();
};

/**
 * Edit User Setting
 * METHOD : PUT
 * URL : /api/userSetting
 * BODY : languageId, theme, currencySymbol, timeZone(name,GMT), afterLogin(page,url)
 */
export const editSettingValid = (req, res, next) => {
  let errors = {};
  let reqBody = req.body;


  if (isEmpty(reqBody.theme)) {
    errors.theme = "REQUIRED";
  }

  if (isEmpty(reqBody.currencySymbol)) {
    errors.currencySymbol = "REQUIRED";
  }


  if (reqBody.afterLogin && (isEmpty(reqBody.afterLogin.page) || isEmpty(reqBody.afterLogin.url))) {
    errors.afterLogin = "REQUIRED"
  } else if (!reqBody.afterLogin) {
    errors.afterLogin = "REQUIRED"
  }

  if (!isEmpty(errors)) {
    return res.status(400).json({ "errors": errors })
  }

  return next();
}

/**
 * Edit User Notification
 * METHOD : PUT
 * URL : /api/editNotif
 * BODY : name, checked
 */
export const editNotifValid = (req, res, next) => {
  let errors = {};
  let reqBody = req.body;

  if (isEmpty(reqBody.name)) {
    errors.name = "REQUIRED";
  }

  if (isEmpty(reqBody.checked)) {
    errors.checked = "REQUIRED";
  } else if (!isBoolean(reqBody.checked)) {
    errors.checked = "INVALID_VALUE";
  }

  if (!isEmpty(errors)) {
    return res.status(400).json({ errors: errors });
  }

  return next();
};

/**
 * Check Forgot Password
 * METHOD : POST
 * URL : /api/forgotPassword
 * BODY : email
 */
export const checkForgotPwdValidate = (req, res, next) => {
  let errors = {},
    reqBody = req.body,
    emailRegex =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,6}))$/;

  if (reqBody.roleType == 1) {
    if (isEmpty(reqBody.email)) {
      errors.email = "Please enter your email";
    } else if (!emailRegex.test(reqBody.email)) {
      errors.email = "Please enter valid email address";
    }
  }
  if (reqBody.roleType == 2) {
    if (isEmpty(reqBody.newPhoneCode)) {
      errors.newPhoneNo = "Please enter your country code ";
    }
    if (isEmpty(reqBody.newPhoneNo)) {
      errors.newPhoneNo = "Please enter your Mobile number";
    }
  }
  if (isEmpty(reqBody.reCaptcha)) {
    errors.reCaptcha = "ReCAPTCHA field is required";
  }
  if (!isEmpty(errors)) {
    return res.status(400).json({ "errors": errors })
  }
  return next();
};

/**
 * Reset Password Without Login
 * METHOD : POST
 * URL : /api/resetPassword
 * BODY : password, confirmPassword, authToken
 */
export const resetPwdValidate = (req, res, next) => {
  let errors = {},
    reqBody = req.body,
    passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{6,18}/g;

  if (isEmpty(reqBody.authToken)) {
    errors.authToken = "AuthToken field is required";
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

/**
 * Check New Phone
 * METHOD : POST
 * URL : /api/phoneChange
 * BODY : newPhoneCode, newPhoneNo
 */
export const newPhoneValidate = (req, res, next) => {
  let errors = {},
    reqBody = req.body;
  let mobileRegex = /^\d+$/;

  if (isEmpty(reqBody.newPhoneCode)) {
    errors.newPhoneCode = "Enter your PhoneCode";
  }

  if (isEmpty(reqBody.newPhoneNo)) {
    errors.newPhoneNo = "Enter your mobile number";
  } else if (!mobileRegex.test(reqBody.newPhoneNo)) {
    errors.newPhoneNo = "Mobile number is invalid";
  }

  if (!isEmpty(errors)) {
    return res.status(400).json({ errors: errors });
  }

  return next();
};

/**
 * Verify New Phone
 * METHOD : PUT
 * URL : /api/phoneChange
 * BODY : otp
 */
export const editPhoneValidate = (req, res, next) => {
  let errors = {},
    reqBody = req.body;


  let mobileRegex = /^\d+$/;

  if (isEmpty(reqBody.newPhoneCode)) {
    errors.phoneNumber = "Enter your mobile code";
  }

  if (isEmpty(reqBody.newPhoneNo)) {
    errors.phoneNumber = "Enter your mobile numebr";
  } else if (!mobileRegex.test(reqBody.newPhoneNo)) {
    errors.phoneNumber = "Mobile number is invalid";
  }


  if (isEmpty(reqBody.otp)) {
    errors.otp = "Verification Code field is required";
  } else if (reqBody.otp.toString().length != 6) {
    errors.otp = "Invalid Verification Code";
  }

  if (!isEmpty(errors)) {
    return res.status(400).json({ errors: errors });
  }

  return next();
};

/**
 * Edit Email
 * METHOD : PUT
 * URL : /api/emailChange
 * BODY : newEmail
 */
export const editEmailValidate = (req, res, next) => {
  let errors = {},
    reqBody = req.body;
  let emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,6}))$/;

  if (isEmpty(reqBody.newEmail)) {
    errors.newEmail = "Email field is required";
  } else if (!emailRegex.test(reqBody.newEmail)) {
    errors.newEmail = "Email is invalid";
  }

  if (!isEmpty(errors)) {
    return res.status(400).json({ errors: errors });
  }

  return next();
};

/**
 * Verify the old email(Edit Email)
 * METHOD : PUT
 * URL : /api/emailChange
 * BODY : token
 */
export const tokenValidate = (req, res, next) => {
  let errors = {},
    reqBody = req.body;

  if (isEmpty(reqBody.token)) {
    errors.token = "Token field is required";
  }

  if (!isEmpty(errors)) {
    return res.status(400).json({ errors: errors });
  }

  return next();
};

export const supportTicketValid = (req, res, next) => {
  let errors = {},
    reqBody = req.body;
  console.log(req.files, "reqBody-----------", req.file, "req body", reqBody);
  if (isEmpty(reqBody.categoryId)) {
    errors.category = "Please Select a Category";
  }

  if (isEmpty(reqBody.message)) {
    errors.ticketMessage = "Message field is required";
  }

  if (!isEmpty(errors)) {
    return res.status(400).json({ errors: errors });
  }

  return next();
};

/**
 * CHECK ANTI-PHISHING VERIFICATION CODE
 * METHOD : POST
 * URL : /api/antiphishingcode/getcode/:type
 * BODY : otp, antiphisingcode
 * PARAMS : phone, email, google_auth
 */
export const APVerificationCodeValidate = (req, res, next) => {
  let errors = {},
    reqBody = req.body,
    reqParams = req.params;


  let codeRegex = /^[a-zA-Z0-9_.-]*$/;
  console.log(reqBody)
  if (isEmpty(reqBody.code)) {
    errors.code = "Required";
  } else if (!codeRegex.test(reqBody.code)) {
    errors.code = "Special character not allowed";
  } else if (reqBody.code.length < 4) {
    errors.code = "Code must contains 4-20 characters"
  } else if (reqBody.code.length > 20) {
    errors.code = "Code must contains 4-20 characters"
  }

  // if (isEmpty(reqBody.mobileOTP)) {
  //   errors.mobileOTP = "Mobile Verification code required";
  // }

  if (isEmpty(reqBody.emailOTP)) {
    errors.emailOTP = "Email Verification code required";
  }

  if (!isEmpty(errors)) {
    return res.status(400).json({ errors: errors });
  }

  return next();
};


export const replyContact = async (req, res, next) => {
  let reqBody = req.body,
    errors = {};
  if (isEmpty(reqBody.reply)) {
    errors.reply = "Reply field is required";
  }

  if (!isEmpty(errors)) {
    return res.status(400).json({ errors: { reply: "Message field is required" } });
  }
  return next();
};
export const emailChangeValidation = (req, res, next) => {
  let errors = {},
    reqBody = req.body;

  if (isEmpty(reqBody.emailOTP)) {
    errors.emailOTP = "Required";
  }
  let emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,6}))$/;

  if (isEmpty(reqBody.email)) {
    errors.email = "Email field is required";
  } else if (!emailRegex.test(reqBody.email)) {
    errors.email = "Email is invalid";
  }
  if (!isEmpty(errors)) {
    return res.status(400).json({ errors: errors });
  }

  return next();
};


export const deleteUPIValidate = (req, res, next) => {
  let errors = {}, reqBody = req.body;

  if (isEmpty(reqBody.upiId)) {
    errors.upiId = "UPI Id Required";
  } else if (!mongoose.Types.ObjectId.isValid(reqBody.id)) {
    errors.upiId = "Invalid UPI id";
  }

  if (!isEmpty(errors)) {
    return res.status(400).json({ "errors": errors })
  }

  return next();
}

export const updateBankDetail = async (req, res, next) => {
  try {
    
    const reqBody = req.body
    let nameRegex = /^[A-Za-z\s]+$/;
    let numberRegex = /^[0-9()-+]+$/;
    let acRegex = /^[0-9]+$/;
    let ifscRegex = /^[0-9A-Za-z]+$/;
    let upiRegex = /^[\w.-]+@[\w.-]+$/

    let errors = {}

    if (isEmpty(reqBody.holderName)) {
      errors.holderName = 'Holder name cannot be empty'
    } else if (!nameRegex.test(reqBody.holderName)) {
      errors.holderName = 'Name cannot have special characters'
    }

    if (isEmpty(reqBody.phoneNo)) {
      errors.phoneNo = 'Phone Number cannot be empty'
    } else if (!numberRegex.test(reqBody.phoneNo)) {
      errors.phoneNo = 'Phone Number contains invalid characters'
    }

    if (isEmpty(reqBody.accountNo)) {
      errors.accountNo = 'Account number cannot be empty'
    } else if (!acRegex.test(reqBody.accountNo)) {
      errors.accountNo = 'Account number should be all numbers'
    }

    if (isEmpty(reqBody.IFSC)) {
      errors.IFSC = 'IFSC cannot be empty'
    } else if (!ifscRegex.test(reqBody.IFSC)) {
      errors.IFSC = 'IFSC contains invalid characters'
    }

    if (isEmpty(reqBody.bankName)) {
      errors.bankName = 'Bank name cannot be empty'
    } else if (!nameRegex.test(reqBody.bankName)) {
      errors.bankName = 'Bank name contains invalid characters'
    }

    if (!isEmpty(reqBody.UPI) && !upiRegex.test(reqBody.UPI)) {
      errors.UPI = 'Invalid UPI ID'
    }

    if (isEmpty(reqBody.countryCode)) {
      errors.phoneNo = 'Country code cannot be empty'
    }

    if (!isEmpty(errors)) {
      return res.status(400).json({ status: false, errors })
    } else {
      return next()
    }

  } catch (error) {
    console.log(error)
    return res.status(500).json({ status: false, message: 'Something went wrong' })
  }
}