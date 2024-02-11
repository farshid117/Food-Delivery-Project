const winston = require("winston")

//todo: Built-in Error Middleware in Express particular Api Routes
module.exports = (error, req, res, next) =>{
    console.log("ExpressErrorMiddelware log syas: ", error)
    winston.error(error.message, error)
    res.status(500).send({ message: `خطایی از سمت سرور رخ داده است : ${error}` });
}