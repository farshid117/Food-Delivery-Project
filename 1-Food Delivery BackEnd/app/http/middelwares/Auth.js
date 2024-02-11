const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
    try {
        const token = req.header("x-auth-token")
        if (!token) return res.status(401).send({ message: "شما اجازه دسترسی به این Route Api را ندارید" })

        //todo: Decode The Token => get PayloadData from token
        const payloadData = jwt.verify(token, config.get("JWTPRIVATEKEY"))//✍️ payloadData
        console.log("PayloadData: ", payloadData) 
        req.payloadData = payloadData;
        //todo next must be put
        next();
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}

