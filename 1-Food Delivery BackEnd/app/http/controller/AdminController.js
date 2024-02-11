const mongoose = require("mongoose");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
var Kavenegar = require("kavenegar");
const NodeCache = require("node-cache");

const ResturantModel = require("../../models/ResturantModel");
const AdminLoginModel = require("../../models/AdminLoginModel");
const {
  validateLoginResturant,
  validateFoodResturant,
} = require("../validator/ResturantValidator");

//✍️ Preparation(آماده سازی) Kavenegar
var api = Kavenegar.KavenegarApi({
  apikey:
    "746669796B634A5578756F425A4F4851596842644C41306D775368497972433078764150544A51414F36773D",
});
//✍️ Preparation NodeCache
const myCache = new NodeCache({ stdTTL: 2 * 60 * 60, checkperiod: 3 * 60 }); //value is persecond
const myCache2 = new NodeCache({ stdTTL: 2 * 60 * 60, checkperiod: 3 * 60 });

class AdminController {
  // ***********************Admin Rsturant Api********************* */

  //todo: Admin Resturant Login Controller
  /*********************** Login ***************** */
  //✍️ POST /api/admin/login
  async login(req, res) {
    const { error } = validateLoginResturant(req.body);
    if (error)
      return res.status(401).send({ message: `Joi Says: ${error.message}` });

    const resturant = await ResturantModel.findOne({
      adminMobile: req.body.adminUsername,
    });
    if (!resturant) 
      return res.status(400).send({message: "ادمین جان : یوزرنیم یا پسورد(جهت ابهام) صحیح نمیباشد"});

    const checkPass = await bcrypt.compare(req.body.adminPass, resturant.adminPass);
    if (!checkPass)
      return res
        .status(400)
        .send({ message: "ادمین جان :یوزرنیم(ابهام)و پسورد صحیح نمیباشد" });

    //✅ send code by mobile message  to Athorization Admin
    let randomNumber = Math.floor(Math.random() * 9000 + 1000).toString(); //⭐️ The code sent from the form is a string
    myCache.set("RANDOM_NUMBER", randomNumber);

    api.VerifyLookup(
      {
        receptor: resturant.adminMobile,
        token: randomNumber,
        template: "sendCode",
      },
      function (response, status) {
        console.log(response);
        console.log(status);
        res.status(status).send(response);
      }
    );
  }

  /*********************** VerifyCode ***************** */
  //✍️ POST /api/admin/verifycode
  async verifyCode(req, res) {
    const code = req.body.code; //✔️ is a String
    const adminMobile = req.query.adminMobile; //✔️ is a String

    const randomNumber = myCache.get("RANDOM_NUMBER");
    if (code !== randomNumber)
      return res.status(400).send({ message: "کد ارسالی صحیح نمیباشد" });

    const resturant = await ResturantModel.findOne({ adminMobile });

    //todo ✔️ Create AdminLogin Model & Cillection in DB
    let loginAdmin = new AdminLoginModel({
      adminMobile,
      resturantName: resturant.name,
      //**in future adminName will be create
    });
    loginAdmin = await loginAdmin.save(); //save in DB, save is Async behavior
    console.log("loginAdmin: ", loginAdmin); // collection of timeLogin be created in DB ?

    //todo ✔️ Send Jwt Token for Admin Panel
    const payload = {
      id: resturant._id,
      role: "admin",
    };
    const token = jwt.sign(payload, config.get("JWTPRIVATEKEY"));

    res.status(200).header("Access-Control-Expose-Headers","x-auth-token").header("x-auth-token", token).send({
      message: "token با موفیقت برای ذخیره در مرورگر ادمین ارسال گردید",
    });
  }

  //todo: Admin Resturant CRUD Food Controller
  /*********************** AddFood ***************** */
  //todo: Route Api => Post api/admin/addfood
  async addFood(req, res) {
    console.log("in AdminController.jsx (req.file) is : ",req.file);
    const { error } = validateFoodResturant(req.body);
    if (error) return res.status(401).send({message: `Joi Says: ${error.message}`});
    
      let resturant = await ResturantModel.findOne({ _id: req.payloadData.id});
      if (!resturant)
        return res.status(400).send({message: "رستورانی با این آیدی یافت نشد" });

      if(req.file){
        resturant.menu.push({
          ..._.pick(req.body, ["foodName", "desc", "price", "categories"]),
          pic: "uploads/" + req.file.filename, //✍️ req.file is a Object that inclouds this properties -> fieldname,originalname,destination,filename,path,mimetype
          // path:"public\upload\filename"
        })
      }else{
        resturant.menu.push({
          ..._.pick(req.body, ["foodName", "desc", "price", "categories"]),
         
        });
      }
      resturant = await resturant.save();  //save in DB, DataBase get _id to food Object automaticly 
      res.status(200).send(resturant.menu); //✔️ menu is Array of foods Object
    
  }
  /*********************** GetFoods ***************** */
   //todo: Route Api => Get api/admin/getfoods
  async getFoods(req, res) {
    try {
      const resturant = await ResturantModel.findOne({
        _id: req.payloadData.id,
      });
      if (!resturant)
        return res.status(400).send("رستورانی با این آیدی وجود ندارد");
      res.status(200).send({ menu: resturant.menu, name: resturant.name });
    } catch (err) {
      console.log(err.message);
      res.status(400).send("رستورانی با این آیدی وجود ندارد");
    }
  }
  /*********************** GetFoodById **************** */
   //todo: Route Api => Post api/admin/getfood/:foodId
  async getFoodById(req, res) {
    try {
      const foodId = req.params.foodId;
      console.log(foodId);
      let resturant = await ResturantModel.findOne({
        _id: req.payloadData.id,
      });
      if (!resturant)
        return res.status(400).send("رستورانی با این آیدی وجود ندارد");
      let food = resturant.menu.id(foodId);
      res.send(food);
    } catch (err) {
      console.log(err.message);
      res.status(400).send("رستورانی با این آیدی وجود ندارد");
    }
  }
  /*********************** EditFood **************** */
  //todo: Route Api => Post api/admin/editfood/:foodId
  async editFood(req, res) {
    console.log("in editfood controller req.file is : ", req.file);
    console.log("in editfood controller req.body is : ", req.body);
    const { error } = validateFoodResturant(req.body);
    if (error) return res.status(401).send({message: `in editfood controller joi says: ${error.message}`});
    try {
      const foodId = req.params.foodId;
      let resturant = await ResturantModel.findOne({
        _id: req.payloadData.id,
      });
      const editedFood = {
        ..._.pick(req.body, ["foodName", "desc", "price", "categories"]),
        pic: "uploads/"+req.file.filename,
      };
      const indexId = resturant.menu.findIndex((item) => item._id == foodId);
      resturant.menu[indexId] = editedFood;

      await resturant.save();
      res.status(200).send(resturant.menu);

      // resturant = await resturant.save()
      // res.status(200).send({message:"edit successfull!",editedResturantFood:resturant})
    } catch (err) {
      console.log(err.message);
      res.status(400).send({ message: `in editfood controller catch says: ${err.message}` });
    }
  }
  /*********************** DeleteFood ************** */
  //todo: Route Api => Post api/admin/deletefood/:foodId
  async deleteFood(req, res) {
    try {
      let resturant = await ResturantModel.findOne({
        _id: req.payloadData.id,
      });
      const foodId = req.params.foodId;
      resturant.menu.id(foodId).remove(); //method of array
      await resturant.save();

      res.status(200).send("food removed successful!");
    } catch (err) {
      console.log(err.message);
      res.status(200).send(err.message);
    }
  }
}
module.exports = new AdminController();
