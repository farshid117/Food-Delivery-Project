const mongoose = require("mongoose");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
var Kavenegar = require("kavenegar");
const ZarinpalCheckout = require("zarinpal-checkout");
const NodeCache = require("node-cache");

const ResturantModel = require("../../models/ResturantModel");
const UserModel = require("../../models/UserModel");
const PeymentModel = require("../../models/PeymentModel");


//✍️ Preparation(آماده سازی) Kavenegar
var api = Kavenegar.KavenegarApi({
  apikey:
    "746669796B634A5578756F425A4F4851596842644C41306D775368497972433078764150544A51414F36773D",
});
//✍️ Preparation ZarinPal
const zarinpal = ZarinpalCheckout.create(
  "00000000-0000-0000-0000-000000000000",
  true
);
//✍️ Preparation NodeCache
const myCache = new NodeCache({ stdTTL: 2 * 60 * 60, checkperiod: 3 * 60 });
const myCache2 = new NodeCache({ stdTTL: 2 * 60 * 60, checkperiod: 3 * 60 });

class UserController {
  // ******************************** User Api****************************** */

  //todo: AddComment by User Controller
  /*********************** addCommentResturant ************** */
  //✍️ /api/user/addcommentresturant/:id"
  async addCommentResturant(req, res) {
    const id = req.params.id; //restaurant id
    console.log("in addCommentResturant Controller id is:", id)
    if (!mongoose.isValidObjectId(id))
      return res.status(404).send({ message: "objectId Not Found" });
    let resturant = await ResturantModel.findById(id);
    resturant.comment.push(_.pick(req.body, ["sender", "text", "score"]));
    resturant = await resturant.save();

    res.status(200).send(resturant.comment);
  }


  //todo: User Login & Register Controller
  /*********************** registerUser ************************ */
  async registerUser(req, res) {
    try {
      const user = await UserModel.findOne({ phone: req.body.phone });
      if (user) return res.status(400).send("این شماره موبایل قبلا ثبت شده ");

      let newUser = new UserModel({
        name: req.body.name,
        phone: req.body.phone,
      });

      var number = Math.floor(Math.random() * 90000 + 10000);
      myCache.set(config.get("UNIQUEKEY"), number);
      myCache2.set(config.get("UNIQUEKEY2"), newUser);
      api.Send(
        {
          message: `کد فعالسازی شما ${number}میباشد`,
          sender: "10008663", //شرکت بیمه آنلاین
          receptor: "09170431514", //?newUser.phone
        },
        function (response, status) {
          console.log("kavenegar Response:", response);
          console.log("kavenegar Status message:", status);
          res.status(status).send({
            message: "کد فعالسازی برایتان ارسال شد",
            kavenegarResponse: response,
            kavenegarStatusCode: status,
            name: newUser.name,
            userId: newUser._id,
          });
        }
      );
    } catch (err) {
      console.log(err.message);
    }
  }
  /*********************** loginUser *************************** */
  async loginUser(req, res) {
    try {
      const user = await UserModel.findOne({ phone: req.body.phone });
      console.log("user: ", user);
      if (!user)
        return res.status(400).send("شماره موبایل وارد شده ثبت نشده است");

      if (req.body.name != user.name)
        return res.status(400).send("نام کاربری اشتباه است");

      const payloadData = {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        active: user.active,
      };
      const token = jwt.sign(payloadData, config.get("JWTPRIVATEKEY"));

      res
        .status(200)
        .header("Access-Control-Expose-Headers", "x-auth-token")
        .header("x-auth-token", token)
        .send({ message: "کاربر فعال شد", token });
    } catch (err) {
      console.log(err);
    }
  }
  /*********************** sendCode ***************************** */
  async sendCode(req, res) {
    api.Send(
      {
        message: `کد فعالسازی شما ${number}میباشد`,
        sender: "10008663", //شرکت بیمه آنلاین
        receptor: "09170431514", //?newUser.phone
      },
      function (response, status) {
        console.log("kavenegar Response:", response);
        console.log("kavenegar Status message:", status);
        res.status(status).send({
          message: "کد فعالسازی برایتان ارسال شد",
          kavenegarResponse: response,
          kavenegarStatusCode: status,
          name: newUser.name,
          userId: newUser._id,
        });
      }
    );
  }
  /*********************** verifyCode *********************** */
  async getCode(req, res) {
    try {
      if (!req.body.code)
        return res.status(400).send("کد فعال‌سازی را وارد کنید");

      const code = +req.body.code;
      console.log("code: ", code);
      const cachedCode = myCache.get(config.get("UNIQUEKEY"));
      const cachedNewUser = myCache2.get(config.get("UNIQUEKEY2"));

      console.log("cachedNewUser: ", cachedNewUser);
      console.log("cachedCode: ", cachedCode);

      if (code == cachedCode) {
        cachedNewUser.active = true;
        const newUser = await cachedNewUser.save();

        const payloadData = {
          id: newUser._id,
          name: newUser.name,
          phone: newUser.phone,
          role: newUser.role,
          active: newUser.active,
        };
        const token = jwt.sign(payloadData, config.get("JWTPRIVATEKEY"));

        res
          .status(200)
          .header("Access-Control-Expose-Headers", "x-auth-token")
          .header("x-auth-token", token)
          .send({ message: "کاربر فعال شد", newUser });
      } else {
        res.status(400).send("کد فعال سازی وارد شده اشتباه است");
      }
    } catch (err) {
      console.log(err.message);
    }
  }


  //todo: User CRUD Controller
  /*********************** GetResturantListForUser ************** */
  //✍️ GET: api/user/allresturants
  async getResturantListForUser(req, res) {
    const resturantsList = await ResturantModel.find()
      .select("name desc address score menu")
      .limit(20);

    res.status(200).send(resturantsList);
  }
  /*********************** getResturantByIdForUser ************** */
  //✍️ GET: api/user/getresturant:id
  async getResturantByIdForUser(req, res) {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id))
      return res.status(404).send({ message: "objectId Not Found" });

    const resturant = await ResturantModel.findById(id) // mongoose fucntion
      .select("name desc address score menu comment")
      .limit(20);

    res.status(200).send(resturant);
  }
  /*********************** updateBascket *********************** */
  async updateBascket(req, res) {
    console.log("in updateBascket req.body is :", req.body);
    const userId = req.payloadData.id;
    const user = await UserModel.findOne({ _id: userId }); // or findById(userId)
    if (!user) return res.status(401).send({ message: "لطفا قبل از خرید یکبار در سایت ثبت نام کنید" });

    const bascket = req.body
    console.log("in updateBascket bascket is: ", bascket); //✍️ bascket is Object

    if (!Object.keys(bascket))
      return res.status(404).send({ message: "حداقل یک غذا باید برگردونی" });
    if (!bascket.resturantId || !bascket.resturantName)
      return res.status(404).send({ message: "مشخصات رستوران را هم باید بفرستی" });

    user.basckets.push(bascket)
    await user.save();
    console.log("Last bascktId: ", user.basckets[user.basckets.length - 1]._id)
    res.status(200).send({ bascketId: user.basckets[user.basckets.length-1]._id, message: "سبد خرید این کاربر در دیتابیس در کالکشن یوزر ذخیره شد" });

  }
  /*********************** getBascket *********************** */
  async getBascket(req, res) {
    try {
      const userId = req.payloadData.id;
      const user = await UserModel.findOne({ _id: userId }); // or findById()
      console.log("user: ", user);
      if (!user)
        return res
          .status(401)
          .send("لطفا قبل از خرید یکبار در سایت ثبت نام کنید");
      const bascket = _.pick(user.bascket, [
        "resturantId",
        "resturantName",
        "foods",
      ]);

      res.status(200).send(bascket);
    } catch (err) {
      console.log(err.message);
    }
  }

  /*********************** checkoutBascket *********************** */
  async checkoutBascket(req, res) {
    try {
      const user = await UserModel.findById(req.payloadData.id);
      console.log("user: ", user);
      const _id = user._id;
      const name = user.name;
      const bascket = user.bascket;
      const resturantName = bascket.resturantName;
      const phone = user.phone;
      const amount = user.bascket.foods.reduce((sum, item) => {
        return (sum += parseInt(item.price) * parseInt(item.count));
      }, 0);

      const response = await zarinpal.PaymentRequest({
        CallbackURL: "http://localhost:3000/api/user/verifypeyment", //Api for success or unsuccess peyment
        Description: `پرداخت به ${resturantName}`,
        Amount: amount, // In Tomans
        phone, //user Mobile? must be resturant phone
        resturantName,
      });

      /*  response ={
              status: ,
              authority: ,
              url: ,
            } */

      console.log("response: ", response);
      if (response.status === 100) {
        const peymentCode = response.authority;
        const peyment = new PeymentModel({
          user: {
            _id,
            name,
            phone,
            bascket,
          },
          amount,
          peymentCode, // authority
        });
        await peyment.save();
        user.bascket = undefined;
        await user.save();
        res.status(200).send(response.url);
      }
    } catch (err) {
      console.log(err);
    }
  }


  //todo: User Peyment Controller
  /*********************** verifyPeyment *********************** */
  async verifyPeyment(req, res) {
    try {
      //zarinPal send Get Request for below Api(callbackUrl) and atomatic add Authority & Status as query string
      //http://localhost:3000/api/user/verifypeyment?Authority=...&Status=OK(NOK) --> callbackUrl
      const peymentCode = req.query.Authority; // capital letter
      const status = req.query.Status; // capital letter
      const peyment = await PeymentModel.findOne({
        peymentCode, //ES6
      });

      if (status === "OK") {
        // OK is capital letter

        const response = await zarinpal.PaymentVerification({
          Amount: peyment.amount,
          Authority: peymentCode,
        });
        /* response = {
                status : 100(-21),
                RefID : 1234567
              } */
        console.log("response verifyPeyment: ", response);
        if (response.status === -21) {
          res.send(
            "مشکلی در پرداخت پیش آمده مبلغ کسر شده از حسابتان ظرف 48 ساعت به حسابتان واریز میشود"
          );
        } else {
          peyment.refId = response.RefID;
          peyment.success = true;
          console.log("peyment: ", peyment);
          await peyment.save();
          res.send(`
                            <div style="text-align: center">
                              <h3>شماره ارجاع: ${response.RefID}</h3>
                              <button><a href="http://127.0.0.1:5500/bill_slip.html?refId=${peyment.refId}">برگشت به سایت</a></button>
                            </div>  
                  `);
        }
      } else {
        res.status(404).send("پرداخت ناموفق");
      }
    } catch (err) {
      console.log(err);
    }
  }
  /*********************** getPeymentDocument *********************** */
  async getPeymentDocument(req, res) {
    try {
      const refId = req.params.refId;
      console.log("refId: ", refId);

      const peyment = await PeymentModel.findOne({
        refId,
      });
      if (!peyment)
        return res.status(400).send("پرداختی با این شماره ارجاع وجود ندارد");

      res.status(200).send(peyment);
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = new UserController()
