const joi = require("joi");
joi.objectId = require("joi-objectid")(joi);

//todo: joi validation to SuperAdmin
/*********************** AddResturant(SuperAdmin) ***************** */
const validateNewResturant = (data) => {
  const returantSchema = joi.object({
    name: joi.string().required(),
    desc: joi.string().required(),
    address: joi.string().required(),
    adminMobile: joi.string().required(),
    adminPass: joi.string().required(),
    pic: joi.string(),
  });
  return returantSchema.validate(data);
};
/*********************** UpdateResturant(SuperAdmin) ***************** */
const validateUpdateResturant = (data) => {
  const schemaResturant = joi.object({
    name: joi.string().required(),
    desc: joi.string().required(),
    address: joi.string().required(),
    adminMobile: joi.string().required(),
    adminPass: joi.string().required(),
    pic: joi.any(),
    _id: joi.objectId(),
  });
  return schemaResturant.validate(data);
};

//todo: joi validation to Resturant Admin
/*********************** Login AdminResturant ***************** */
const validateLoginResturant = (data) => {
  const schemaResturant = joi.object({
    adminUsername: joi.string().required(),
    adminPass: joi.string().required(),
  });
  return schemaResturant.validate(data);
};
/*********************** AddFood(Admin) ***************** */
const validateFoodResturant = (data) => {
  const schemaFood = joi.object({
    foodName: joi.string().required(),
    desc:     joi.string().required(),
    price:    joi.number().required(),
    categories : joi.string(),
    pic:      joi.any(),
  });
  return schemaFood.validate(data);
};

//todo: joi validation to Site User
/*********************** (AddUser) ***************** */
const validateNewUser = (data) => {
  const UserSchema = joi.object({
    name: joi.string().required(),
    phone: joi.number().required(),
  });
  return UserSchema.validate(data);
};


//✍️ Public Export
module.exports = {     
  validateNewResturant,
  validateUpdateResturant,
  validateLoginResturant,
  validateFoodResturant,
  validateNewUser,
};
