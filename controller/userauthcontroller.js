import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { ACCOUNT_VERIFICATION_HTML_TEMPLETE } from "../config/accont_verification_templete.js";
import { PASSWORD_RESET_TEMPLATE } from "../config/reset_password_templete.js";

import transporter from "../config/nodemailer.js";
import User from "../models/user.model.js";
dotenv.config();
//register new user
export const register = async (req, res) => {
  const { username, email, password } = req.body;
  const profileUrl = req.file ? req.file.buffer.toString("base64") : "";

  if (!username || !email || !password) {
    return res.status(400).json({ succss: false, massage: "missing details" });
  }
  // const profilePic = req.file?.filename || "";
  try {
    const isexistUser = await User.findOne({ email });
    if (isexistUser) {
      return res
        .status(400)
        .json({ succss: false, massage: "user already exist" });
    }
    //hash password
    const salt = await bcrypt.genSalt(10);
    const hasedPassword = await bcrypt.hash(password, salt);
    //verify code
    const verifyCode = Math.floor(10000 + Math.random() * 90000).toString();
    const codeExpireTime = Date.now() + 24 * 60 * 60 * 1000;

    //save user
    const newUser = new User({
      username,
      email,
      password: hasedPassword,
      profileUrl,
      verifyCode,
      codeExpireTime,
    });

    const createdUser = await newUser.save();
    //gen session tokens

    const newToken = await jwt.sign(
      { id: createdUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );
    //send verification code
    const mailReciver = {
      from: process.env.APP_EMAIL,
      to: createdUser.email,
      subject: "Account Verification OTP",
      html: ACCOUNT_VERIFICATION_HTML_TEMPLETE.replace("{{otp}}", verifyCode),
    };
    //send email
    await transporter.sendMail(mailReciver);
    return res.status(200).json({
      succss: true,
      newToken,
      user: {
        id: createdUser._id,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ succss: false, massage: `Internal server error` });
  }
};
//verify account
export const verifyAccount = async (req, res) => {
  const { userId, verifyCode } = req.body;

  if (!userId || !verifyCode) {
    return res.status(400).json({ success: false, message: "Missing Details" });
  }

  try {
    const user = await User.findById(userId);
    //when user not exist
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    //when invalid otp
    if (user.verifyCode == "" || user.verifyCode != verifyCode) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    //if otp expired
    if (user.codeExpireTime < Date.now()) {
      return res
        .status(408)
        .json({ success: false, message: "Request time out" });
    }

    //when all set
    user.isVerified = true;
    user.verifyCode = "";
    user.codeExpireTime = 0;
    //save updated user

    await user.save();
    //welcome email
    const mailReciver = {
      from: process.env.APP_EMAIL,
      to: user.email,
      subject: "Welcome To DATE NET.",
      text: `Welcome  ${user.username} to Date Net forum.Your account has been verified succsussfuly.stay with us and explor more content`,
    };
    //send email
    await transporter.sendMail(mailReciver);
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileUrl: user.profileUrl,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
//user login
export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, massage: "enter all details" });
  }
  try {
    const existUser = await User.findOne({ username });
    if (!existUser) {
      return res
        .status(400)
        .json({ success: false, massage: " user not found" });
    }
    //check password validation
    const isValidPassword = await bcrypt.compare(password, existUser.password);
    if (!isValidPassword) {
      return res
        .status(400)
        .json({ success: false, massage: "invalid password" });
    }
    //gen new token
    const newToken = await jwt.sign(
      { id: existUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );
    //response-succsuss
    return res.status(200).json({
      success: true,
      newToken,
      user: {
        id: existUser._id,
        username: existUser.username,
        email: existUser.email,
        profileUrl: existUser.profileUrl,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, massage: "internal server error" });
  }
};

export const resetPasswordVerification = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, massage: "enter all details" });
  }

  try {
    const existUser = await User.findOne({ email });
    if (!existUser) {
      return res
        .status(404)
        .json({ success: false, massage: "User not found" });
    }

    //verify code
    const verifyCode = Math.floor(10000 + Math.random() * 90000).toString();
    const codeExpireTime = Date.now() + 24 * 60 * 60 * 1000;

    existUser.verifyCode = verifyCode;
    existUser.codeExpireTime = codeExpireTime;
    // existUser.password = password;
    //save with verificaton data
    await existUser.save();
    //send verification code
    const mailReciver = {
      from: process.env.APP_EMAIL,
      to: existUser.email,
      subject: "password reset OTP",
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", verifyCode),
    };
    //send email
    await transporter.sendMail(mailReciver);
    return res.status(200).json({
      success: true,
      user: {
        id: email,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: true, massage: "internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;

  if (!email || !otp || !password) {
    return res
      .status(400)
      .json({ success: false, massage: "enter all details" });
  }

  try {
    const existUser = await User.findOne({ email });
    if (!existUser) {
      return res
        .status(404)
        .json({ success: false, massage: "User not found" });
    }

    if (otp == "" || otp != existUser.verifyCode) {
      return res.status(400).json({ success: false, massage: "Invalid OTP" });
    }

    if (existUser.codeExpireTime < Date.now()) {
      return res
        .status(408)
        .json({ success: false, massage: "Request Time out" });
    }
    //hash password
    const salt = await bcrypt.genSalt(10);
    const hasedPassword = await bcrypt.hash(password, salt);
    //when all set
    existUser.isVerified = true;
    existUser.verifyCode = "";
    existUser.codeExpireTime = 0;
    existUser.password = hasedPassword;
    //save updated user

    await existUser.save();
    //welcome email
    const mailReciver = {
      from: process.env.APP_EMAIL,
      to: existUser.email,
      subject: "Password Reset Succsussfuly",
      text: `${existUser.username} Your password is reset succsussfuly.Log in to your account using new creadientials`,
    };
    //send email
    await transporter.sendMail(mailReciver);
    return res.status(200).json({
      success: true,
      massage: "password reset succssfulty",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, massage: "internal server error" });
  }
};
