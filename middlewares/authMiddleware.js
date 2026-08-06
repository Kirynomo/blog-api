require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/users");

module.exports.userVerification = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const accessToken = authHeader.split(" ")[1];
  if (!accessToken) {
    return res.json({ msg: "no access token" });
  }

  jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET,
    async (err, data) => {
      if (err) {
        return res.json({ status: false });
      } else {
        const user = await User.findById(data.id);
        if (!user) {
          return res.json({ msg: "no user found" });
        }
        req.user = user;
        next();
      }
    },
  );
};
