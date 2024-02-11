module.exports = (req, res, next) => {
  if (req.payloadData.role !== "user")
    return res.status(401).send("عزیزم لاگین نکرده اید");
  
  next();
};
