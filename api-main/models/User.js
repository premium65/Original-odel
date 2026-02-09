// import package
const mongoose = require("mongoose")
import jwt from "jsonwebtoken"
var crypto = require("crypto")

// import config
import config from "../config"

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const bookingSchema = new Schema({
  count: {
    type: Number,
    default: 0,
  },
  _id: {
    type: ObjectId,
    ref: "booking",
  },
})
const levelSchema = new Schema({
  badge: {
    type: String,
    enum: ["trial", "gold", "diamond"],
    default: "trial",
  },
  prize: {
    type: String,
  },
  commissionFee: {
    type: String,
    default: "",
  },
  taskCount: {
    type: String,
    default: "",
  },
})
const BankDetailsSchema = new Schema({
  bankName: {
    type: String,
    default: "",
  },
  accountNo: {
    type: String,
    default: "",
  },
  phoneNo: {
    type: Number,
    default: "",
  },
  holderName: {
    type: String,
    default: "",
  },
  UPI: {
    type: String,
    default: "",
  },
  IFSC: {
    type: String,
    default: "",
  },
  countryCode: {
    type: Number,
  },
})
const bonusSchema = new Schema({
  amount: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    default: "",
  },
  userStatus: {
    type: String,
    default: "new",
  },
  taskCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
})
const premiumTaskSchema = new Schema({
  taskNo: {
    type: String,
    default: "",
  },
  status: {
    type: Boolean,
    default: false,
  },
  amount: {
    type: Number,
  },
})

const UserSchema = new Schema({
  adminSeqNo: {
    type: Number,
  },
  userId: {
    type: String,
    unique: true,
    required: true,
  },
  userName: {
    type: String,
  },
  premiumTask: [premiumTaskSchema],
  badge: {
    type: String,
  },
  profileImage: {
    type: String,
    default: "",
  },
  firstName: {
    type: String,
    default: "",
  },
  lastName: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    // required: true
  },
  phoneCode: {
    type: String,
    default: "",
  },
  phoneNo: {
    type: String,
    default: "",
  },
  otp: {
    type: String,
    default: "",
  },
  otptime: {
    type: Date,
    default: "",
  },
  phoneOTP: {
    type: String,
    default: "",
  },
  phoneOTPtime: {
    type: Date,
    default: "",
  },
  emailOTP: {
    type: String,
    default: "",
  },
  emailOTPtime: {
    type: Number,
    default: "",
  },
  newEmail: {
    type: String,
    default: "",
  },
  requestType: {
    type: String,
    default: "",
  },
  newEmailToken: {
    type: String,
    default: "",
  },
  newPhone: {
    phoneCode: {
      type: String,
      default: "",
    },
    phoneNo: {
      type: String,
      default: "",
    },
  },
  hash: {
    type: String,
  },
  salt: {
    type: String,
  },
  blockNo: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },

  city: {
    type: String,
    default: "",
  },
  state: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    default: "",
  },
  postalCode: {
    type: String,
    default: "",
  },
  google2Fa: {
    secret: {
      type: String,
      default: "",
    },
    uri: {
      type: String,
      default: "",
    },
  },
  emailStatus: {
    type: String,
    default: "unverified", //    default: 'unverified' //unverified, verified
  },
  phoneStatus: {
    type: String,
    default: "unverified", //    default: 'unverified' //unverified, verified
  },
  type: {
    type: String,
    enum: [
      "not_activate",
      "basic_pending",
      "basic_submitted",
      "basic_verified",
      "advanced_pending",
      "advanced_verified",
      "pro_pending",
      "pro_verified",
    ],
    default: "basic_pending", //not_activate, basic, advanced, pro
  },
  mailToken: {
    type: String,
    default: "", //
  },
  conFirmMailToken: {
    type: String,
    default: "", //
  },
  referralCode: {
    type: String,
    default: "",
  },
  referrer: {
    type: ObjectId,
    default: null,
    ref: "user",
  },
  bonus: [bonusSchema],
  bankDetails: [BankDetailsSchema],
  levelDetails: [levelSchema],
  // upiDetails:[UPIDetailsSchema],
  // qrDetails:[QRDetailsSchema],
  status: {
    type: String,
    default: "unverified", //unverified, verified
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userLocked: {
    type: String,
    default: "false",
  },
  userIp: {
    type: String,
    default: "",
  },
  antiphishingcode: {
    type: String,
    default: "",
  },

  /* ------------------------ */

  role: {
    type: String,
    default: "user",
  },
  childIds: {
    type: [ObjectId],
    ref: "users",
  },
  referaluserid: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  refCount: {
    type: Number,
    default: 0,
  },
  refLevel: {
    type: Number,
    default: 0,
  },
  refLevelPoints: {
    type: Number,
    default: 0,
  },
  isBlock: {
    type: Boolean,
    default: false,
  },
  login_attempt: {
    type: Number,
    default: 0,
  },
  lock_session: {
    type: Date,
  },
  invitationCode: {
    type: String,
  },
  changepassword: {
    type: Boolean,
    default: false,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  adminApproval: {
    type: Boolean,
    default: false,
  },
  profilePic: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
    default: "",
  },
  bookings: [bookingSchema],
  taskCount: {
    type: Number,
    default: 0,
  },
  taskBlocked: {
    type: Boolean,
    default: false,
  },
})

// UserSchema.virtual('id').get(function () {
//   return this._id.toHexString();
// });

// UserSchema.set('toJSON', {
//   virtuals: true
// });

/**
 * Pre-save hook
 */
UserSchema.pre("save", function (next) {
  if (!this.isNew) return next()

  if (!validatePresenceOf(this.hash)) next(new Error("Invalid password"))
  else next()
})

var validatePresenceOf = function (value) {
  return value && value.length
}

// Validate empty password
UserSchema.path("hash").validate(function (hashedPassword) {
  return hashedPassword.length
}, "Password cannot be blank")

/**
 * Virtuals
 */
UserSchema.virtual("password")
  .set(function (password) {
    this._password = password
    this.salt = this.makeSalt()
    this.hash = this.encryptPassword(password)
  })
  .get(function () {
    return this._password
  })

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hash
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function () {
    return crypto.randomBytes(16).toString("base64")
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function (password) {
    if (!password || !this.salt) return ""
    var salt = new Buffer(this.salt, "base64")
    return crypto
      .pbkdf2Sync(password, salt, 100000, 128, "sha512")
      .toString("base64")
  },
}

UserSchema.methods.generateJWT = function (payload) {
  var token = jwt.sign(payload, config.secretOrKey)
  return `Bearer ${token}`
}

UserSchema.virtual("wallet", {
  ref: "wallet",
  localField: "userId",
  foreignField: "userId",
  justOne: true,
})

UserSchema.set("toObject", { virtuals: true })
UserSchema.set("toJSON", { virtuals: true })

const User = mongoose.model("user", UserSchema, "user")
export default User
