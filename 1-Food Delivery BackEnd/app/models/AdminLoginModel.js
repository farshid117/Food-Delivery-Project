const mongoose = require("mongoose");

const adminLoginSchema = new mongoose.Schema({
  adminMobile: { type: String, required: true},
  resturantName: { type: String, required: true },
  timeLogin: { type: Date, default: Date.now},
});


const AdminLoginModel = mongoose.model("adminlogins", adminLoginSchema);

module.exports = AdminLoginModel;
