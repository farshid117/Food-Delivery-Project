const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  sender: { type: String, required: true, default:"مهمان" },
  text:   { type: String, required: true },
  score:  { type: Number, enum:[1, 2, 3, 4, 5] },
});

const foodSchema = new mongoose.Schema({
  foodName: { type: String, required: true },
  desc:     { type: String, required: true },
  price:    { type: Number, required: true },
  categories: {
    type: String,
    required: true,
    enum: ["صبحانه", "ناهار", "شام", "کافه", "فست فود"],
  },
  comment: [commentSchema],
  score: { type: Number, enum: [0, 1, 2, 3, 4, 5], default: 0 },
  pic: {
    type: String,
    default:
      "https://safarzon.com/mag/%D8%A8%D8%A7-%D8%A8%D9%87%D8%AA%D8%B1%DB%8C%D9%86-%D8%B1%D8%B3%D8%AA%D9%88%D8%B1%D8%A7%D9%86-%D9%87%D8%A7%DB%8C-%D8%AA%D9%87%D8%B1%D8%A7%D9%86-%D8%A2%D8%B4%D9%86%D8%A7-%D8%B4%D9%88%DB%8C%D8%AF/",
  },
//  discount: { type: Number, default: 0, enum: [10, 20, 30, 40, 50, 60, 70] },
});

//todo: create ResturantModel => resturants collection
const resturantSchema = new mongoose.Schema({
  //👮 Created By: SuperAdmin in SuperAdminPanel
  name: { type: String, required: true },
  desc: { type: String, required: true },
  adminMobile: { type: String, required: true, unique: true},
  adminPass: { type: String, required: true },
  address: { type: String, required: true },
  pic: {
    type: String,
    default: "https://safarzon.com/mag/%D8%A8%D8%A7-%D8%A8%D9%87%D8%AA%D8%B1%DB%8C%D9%86-%D8%B1%D8%B3%D8%AA%D9%88%D8%B1%D8%A7%D9%86-%D9%87%D8%A7%DB%8C-%D8%AA%D9%87%D8%B1%D8%A7%D9%86-%D8%A2%D8%B4%D9%86%D8%A7-%D8%B4%D9%88%DB%8C%D8%AF/",
  },

  //َ👲 Created By: AdminResturant in AdminPanel
  //👲 resturantPhone
  menu: [foodSchema],

  //💳 Created By: User in Site NodeFood
  comment: [commentSchema],
  score: { type: Number, enum: [0, 1, 2, 3, 4, 5], default: 0 },
  //order : [orderSchema]
});

const ResturantModel = mongoose.model("resturant", resturantSchema);

module.exports = ResturantModel; // export default
