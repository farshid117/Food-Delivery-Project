const express = require("express");


const SuperAdminController = require("../http/controller/SuperAdminController");


const router = express.Router();

//✍️ POST api/superadmin/
router.post("/", SuperAdminController.addResturant);

//✍️ GET api/superadmin/
router.get("/", SuperAdminController.getResturantsList);

//✍️ GET api/superadmin/:id
router.get("/:id", SuperAdminController.getResturantById);

//✍️ PUT api/superadmin/:id
router.put("/:id", SuperAdminController.editResturant);

//✍️ DELETE api/superadmin/:id
router.delete("/:id", SuperAdminController.deleteResturant);



module.exports = router; //default export
