module.exports = (req, res, next) => {
  if (req.payloadData.role !== "admin")
    return res.status(401).send({ message: "عزیزم شما ادمین نیستید" });

  next();
};
