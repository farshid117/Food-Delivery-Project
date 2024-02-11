const express = require("express");

const Auth = require('../http/middelwares/Auth');
const Admin = require('../http/middelwares/Admin');
const Upload = require('../http/middelwares/Upload');
const AdminController = require('../http/controller/AdminController');



/*=============================================
=                   Ruter Section            =
 =============================================*/

const router = express.Router();

//todo: Admin Resturant Login Routes
//✍️ /api/admin/login
router.post("/login", AdminController.login);

//✍️ /api/admin/verifycode
router.post("/verifycode", AdminController.verifyCode);


//todo: Admin resturant CRAD Food Routes
//✍️ /api/admin/addfood/
router.post("/addfood", [Auth, Admin, Upload], AdminController.addFood);

//✍️ /api/admin/getfoods
router.get("/getfoods", [Auth, Admin], AdminController.getFoods);

//✍️ /api/admin/getfood/:foodId
router.get("/getfood/:foodId", [Auth, Admin], AdminController.getFoodById);

//✍️ /api/admin/editfood/:foodId
router.put("/editfood/:foodId", [Auth, Admin, Upload], AdminController.editFood);

//✍️ /api/admin/deletefood/:foodId
router.delete("/deletefood/:foodId", [Auth, Admin], AdminController.deleteFood);



module.exports = router; //default export
