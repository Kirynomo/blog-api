const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/users");
const {
  createAccessToken,
  createRefreshToken,
} = require("../utils/SecretToken");

module.exports.Signup = async (req, res) => {
  const { name, email, password } = req.body.User;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.json({ msg: "User already exists" });
  }
  const user = await User.create({ name, email, password });

  const accessToken = createAccessToken(user._id);
  const refreshToken = createRefreshToken(user._id);

  res.cookie("accessToken", accessToken, {
    httpOnly: false,
  });

  user.refreshToken = refreshToken;
  await user.save();

  res.json({ msg: "signed in successfully", user });
};

module.exports.Login = async (req, res) => {
  const { email, password } = req.body.User;
  if (!email || !password) {
    return res.json({ msg: "pls enter correct email and password" });
  }

  const user = await User.findOne({ email });
  const auth = await bcrypt.compare(user.password, password);

  if (!auth) {
    return res.json({ msg: "incorrect password or email" });
  }

  const accessToken = createAccessToken(user._id);
  const refreshToken = createRefreshToken(user._id);

  res.cookie("accessToken", accessToken, {
    httpOnly: false,
  });

  user.refreshToken = refreshToken;
  await user.save();

  res.json({ msg: "logged in successfully", user });
};
