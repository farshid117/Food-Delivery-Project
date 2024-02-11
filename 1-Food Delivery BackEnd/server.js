const express = require("express");
const mongoose = require("mongoose");
const morgan = require('morgan');
const config = require('config');
const winston = require('winston');
require('winston-mongodb');
require('express-async-errors');
var cors = require('cors')

const ExpressErrorMiddleware = require("./app/http/middelwares/ExpressErrorMiddleware");
const SuperAdminRoutes = require('./app/routes/SuperAdminRoutes');
const AdminRoutes = require('./app/routes/AdminRoutes');
const UserRoutes = require('./app/routes/UserRoutes');

const app = express();
//todo: ✔️ Save ErrorLog To File and MongoDB by Winston : مشخص کردن شیوه لاگ گیری وینستون
winston.add(new winston.transports.File({ filename: "errorLog.log" })); //Specify Logging Method
winston.add(new winston.transports.MongoDB({
        db: "mongodb://localhost:27017/courseApiNodejs",
        level: "error",
        options: { useUnifiedTopology: true },
        //برای اینکه وارنینگ در ترمینال ندهد تنظیمات اتصال به دیتابیس توسط مانگوس را اینجا میاریم
  })
);
//todo: ✔️ Handle Sync&Async Error Out of Api Routes
process.on("uncaughtException", (err) => {
  console.log(err);
  winston.error(err.message, err);
});
process.on("unhandledRejection", (err) => {
  console.log(err);
  winston.error(err.message, err);
});

//todo: ✔️ built-in Middelware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

//todo: ✔️ third-Party Middleware
if (app.get("env") === "development") app.use(morgan("tiny"));
app.use(cors());

//todo: ✔️ internal Middleware
// app.use(logger)

//todo: ✔️ Current Configuration
console.log(app.get("env"));
//console.log(config.get("databaseAddress"))

//todo: ✔️ Create Sync&Async Error for Example
/*( new Promise((resolve,reject)=>{
  reject(new Error("Make Async Error Outof Api Routes with new Promise"))
}))()

throw new Error("Throw Sync Error") */

//todo: ✔️ Connect TO MongoDB
//Database URL is : "mongodb://localhost:27017/courseApiNodejs"
mongoose
  .connect(config.get("DatabaseUrl"), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("DB Connected");
    // winston.info("DB Connected")
  })
  .catch((err) => console.error("DB Not Connected", err));

//todo: ✔️ Api Routes
app.use("/api/superadmin", SuperAdminRoutes );
app.use("/api/admin", AdminRoutes );
app.use("/api/user", UserRoutes);

//todo: ✔️ Built-in Express Error Middleware for handle async Api-Routes Error
app.use(ExpressErrorMiddleware);

//todo: ✖️ Athentication Mistake Routes
app.get("/*", (req, res) => {
  res.status(404).send({ message: "این Api Route وجود ندارد" });
})
app.post("/*", (req,res) =>{
   res.status(404).send({ message: "این Api Route وجود ندارد" });
})
app.put("/*", (req,res) =>{
   res.status(404).send({ message: "این Api Route وجود ندارد" });
})
app.delete("/*", (req,res) =>{
   res.status(404).send({ message: "این Api Route وجود ندارد" });
})

//todo: Server Listener on Port
const port = process.env.myPort || 3000;
app.listen(port, (err) => {
  if (err) console.log(err);
  else console.log(`server is listening on port ${port}`);
});


