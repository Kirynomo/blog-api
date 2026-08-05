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
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
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
  if (!user) {
    return res.json({ msg: "cant find user " });
  }

  const auth = await bcrypt.compare(password, user.password);
  if (!auth) {
    return res.json({ msg: "incorrect password or email" });
  }

  const accessToken = createAccessToken(user._id);
  const refreshToken = createRefreshToken(user._id);

  res.cookie("accessToken", accessToken, {
    httpOnly: false,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
  });

  user.refreshToken = refreshToken;
  await user.save();

  res.json({ msg: "logged in successfully", user });
};

module.exports.Refresh = async (req, res) => {
  const refreshToken = req.cookie.refreshToken;
};

module.exports.Logout = async (req, res) => {
  const refreshToken = req.cookie.refreshToken;
  if (!refreshToken) {
    return res.json({ msg: "no refresh token" });
  }

  const user = User.findOne({ refreshToken });
  if (user) {
    user.refreshToken = "";
    await user.save();
  }

  res.clearCookie("accessToken", {
    httpOnly: false,
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
  });

  res.json({ msg: "logged out" });
};
