const express = require("express");

const UserController = require("../http/controller/UserController");
const Auth = require("../http/middelwares/Auth");
const UserAuth = require("../http/middelwares/UserAuth");

const router = express.Router();

//✍️ /api/user/allresturants
router.get("/allresturants", UserController.getResturantListForUser);
//✍️ /api/user/getresturant:id
router.get("/getresturant:id", UserController.getResturantByIdForUser);


/*----------todo  Login & Register  ----------*/
//✍️ /api/user/addcommentresturant/:id"
router.post("/addcommentresturant/:id", UserController.addCommentResturant);

//✍️ /api/user/register
router.post("/register", UserController.registerUser);

//✍️ /api/user/login
router.post("/login", UserController.loginUser);


//✍️ /api/user/sendCode
router.post("/sendCode", UserController.sendCode);

//✍️ /api/user//getCode
router.post("/getCode", UserController.getCode);


/*----------todo  Bascket & Pryment  ----------*/
//✍️ /api/user/updatebascket
router.post("/updatebascket", [Auth, UserAuth], UserController.updateBascket);

//✍️ /api/user/getbascket
router.get("/getbascket", [Auth, UserAuth], UserController.getBascket);

//✍️ /api/user/checkoutbascket
router.get("/checkoutbascket", [Auth, UserAuth], UserController.checkoutBascket);

//✍️ /api/user/verifypeyment
router.get("/verifypeyment", UserController.verifyPeyment);

//✍️ /api/user/getpeymentdocument:refId
router.get("/getpeymentdocument:refId", [Auth, UserAuth], UserController.getPeymentDocument)


//router.get("/resturantlist",[Auth,Admin,upload.single("foodPhoto")], getResturantListForUser);

//router.post("/food/photo",[Auth,Admin,upload.single("foodPhoto")], setFoodPhoto);

module.exports = router; //default export
