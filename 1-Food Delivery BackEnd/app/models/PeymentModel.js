const mongoose = require("mongoose");

/* const bascketSchema = new mongoose.Schema({
  resturantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "resturant"
  },
  resturantName: String,
  orders: [{
    foodId: { type: String, required: true },
    foodName: { type: String, required: true },
    price: { type: Number, required: true },
    count: { type: Number, required: true },
  }]
}) */

//todo: create ResturantModel => resturants collection
const peymentSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  }, 

  bascketId: String,

  peymentStatus: {
    type: String,
    default: "پرداخت نشده",
    enum:["موفق","ناموفق","پرداخت نشده"]
  },
  peymentCode: String,
  refId: String,
  amount: Number,

});

const PeymentModel = mongoose.model("payment", peymentSchema);

module.exports = PeymentModel;
