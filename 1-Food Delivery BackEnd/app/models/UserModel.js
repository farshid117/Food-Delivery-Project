const mongoose = require("mongoose");

const bascketSchema = new mongoose.Schema({
  resturantId : {
    type: mongoose.Schema.Types.ObjectId,
    ref: "resturant"
  },
  ordersTotalPrice:{type:Number},
  resturantName: String,
  orders:[{
    foodId:   { type: String, required: true },
    foodName: { type: String, required: true },
    price:    { type: Number, required: true },
    count:    { type: Number, required: true },
  }]
})

//todo: create ResturantModel => resturants collection
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: Number, required: true , unique: true },
  role: { type: String, default: "user" },
  active:{type: Boolean, default: false},
  basckets : [bascketSchema]
 
});

const UserModel = mongoose.model("users", userSchema);

module.exports = UserModel;
