const mongoose = require("mongoose");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
var Kavenegar = require("kavenegar");
var api = Kavenegar.KavenegarApi({
  apikey:
    "746669796B634A5578756F425A4F4851596842644C41306D775368497972433078764150544A51414F36773D",
});
const NodeCache = require("node-cache");
const myCache = new NodeCache();
const myCache2 = new NodeCache();

const ResturantModel = require("../../models/ResturantModel");
const {
  validateNewResturant,
  validateUpdateResturant,
} = require("../validator/ResturantValidator");

class SuperAdminController {
  //todo **********************Super Admin Api********************** */
  /*********************** AddResturant ***************** */
  //✍️ POST api/superadmin/
  async addResturant(req, res) {
    const { error } = validateNewResturant(req.body);
    if (error) return res.status(400).send({ message: error.message });

    const admin = await ResturantModel.findOne({
      adminMobile: req.body.adminMobile,
    });
    if (admin)
      return res.status(400).send({
        message:
          "سوپر ادمین جان: این شماره موبایل قبلا برای ادمین دیگری ثبت شده!!",
      });

    let newResturant = new ResturantModel(
      _.pick(req.body, [
        "name",
        "desc",
        "adminMobile",
        "adminPass",
        "address",
        "pic",
      ])
    );
    const salt = await bcrypt.genSalt(10);
    const passHashed = await bcrypt.hash(newResturant.adminPass, salt);
    newResturant.adminPass = passHashed;

    newResturant = await newResturant.save(); //* after saved in DB,_id added into Object automaticlly
    console.log("newResturant: ", newResturant); //newTesturant with _id
    res.status(200).send(newResturant);
  }
  /*********************** getAllResturants ***************** */
  //✍️ GET: api/superadmin/
  async getResturantsList(req, res) {
    const pageNumber = req.query.pagenumber || 1;
    const pageSize = 10;

    const resturantsList = await ResturantModel.find()
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .select("name desc adminMobile  address pic score comment ");

    res.status(200).send(resturantsList);
  }
  /*********************** getOneResturantByID **************** */
  //✍️ GET: api/superadmin/:id
  async getResturantById(req, res) {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(404).send("objectId Not Found");
    console.log("req.params.id: ", req.params.id);

    const resturantInfo = await ResturantModel.findById(req.params.id);
    if (!resturantInfo) return res.status(404).send("Not Found");

    res.status(200).send(resturantInfo);
  }
  /*********************** UpdateOneResturant(Edit) ************ */
  //✍️ PUT: api/superadmin/:id
  async editResturant(req, res) {
    if (!mongoose.isValidObjectId(req.params.id))
      //✍️ this Response is shown in the Alert that there is in the Catch(err => {}) for consume promise in FrontEnd side
      return res
        .status(404)
        .send({ message: "آیدی ارسالی درست و ولید نمیباشد" });

    const { error } = validateUpdateResturant({
      ...req.body,
      _id: req.params.id,
    });
    //✍️ this Response is shown in the Alert that there is in the Catch(err => {}) for consume promise in FrontEnd side
    if (error)
      return res.status(400).send({
        message: "خطای اعتبار سنجی joi در آپدیت کردن اطلاعات رستوران",
      });

    //✍️ Validate Check for Unique adminMobile
    const resturant = await ResturantModel.findOne({_id: req.params.id});

    //✍️ this Response is shown in the Alert that there is in the Catch(err => {}) for consume promise in FrontEnd side
    if (!resturant)  return res.status(404).send({ messsage: "رستوران با این آیدی یافت نشد" });
    else if (resturant && resturant.adminMobile !== req.body.adminMobile) {
          const checkOtherResturant = await ResturantModel.findOne({
            adminMobile: req.body.adminMobile,
          });
          //✍️ this response show in the Catch(err => {}) in FrontEnd side
          if (checkOtherResturant) 
            return res
              .status(400)
              .send({message: "سوپر ادمین جان: این شماره موبایل قبلا برای ادمین دیگری ثبت شده!!",});
           else{
                   let resturantEdited = await ResturantModel.findByIdAndUpdate(
                     req.params.id, //is Object --> {_id: req.params.id}
                     {
                       $set: _.pick(req.body, [
                         "name",
                         "desc",
                         "adminMobile",
                         "adminPass",
                         "address",
                         "pic",
                       ]),
                     },
                     { new: true }
                   );

                   const salt = await bcrypt.genSalt(10);
                   const hashedAdminPass = await bcrypt.hash(
                     resturantEdited.adminPass,
                     salt
                   );
                   resturantEdited.adminPass = hashedAdminPass;
                   resturantEdited = await resturantEdited.save();

                   //✍️ this Response is shown in the Alert that there is in the then(res => {}) for consume promise in FrontEnd side
                   res.status(200).send({
                     message: "سوپر ادمین جان: رستوران مورد نظر ویرایش گردید",
                   });
           }
          
    }else {
      let resturantEdited = await ResturantModel.findByIdAndUpdate(
        req.params.id, //is Object --> {_id: req.params.id}
        {
          $set: _.pick(req.body, [
            "name",
            "desc",
            "adminMobile",
            "adminPass",
            "address",
            "pic",
          ]),
        },
        { new: true }
      );

      const salt = await bcrypt.genSalt(10);
      const hashedAdminPass = await bcrypt.hash(
        resturantEdited.adminPass,
        salt
      );
      resturantEdited.adminPass = hashedAdminPass;
      resturantEdited = await resturantEdited.save();

      //✍️ this Response is shown in the Alert that there is in the then(res => {}) for consume promise in FrontEnd side
      res
        .status(200)
        .send({ message: "سوپر ادمین جان: رستوران مورد نظر ویرایش گردید" });
    }
  }
  /*********************** DeleteOneResturant ***************** */
  async deleteResturant(req, res) {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).send("Resturant Id Is Mistake");

    const resturantDeleted = await ResturantModel.findByIdAndRemove(
      req.params.id
    ); // --> {_id: req.params.id}

    if (!resturantDeleted)
      return res.status(404).send("Not Found resturant for Delete in database");
    console.log(resturantDeleted);
    res.status(200).send({ message: "Was Deleted !" });
  }
}

module.exports = new SuperAdminController();
