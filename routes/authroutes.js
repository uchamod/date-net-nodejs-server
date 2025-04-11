import express from "express";
import {
  login,
  register,
  resetPassword,
  resetPasswordVerification,
  verifyAccount,
} from "../controller/userauthcontroller.js";
import upload from "../middleware/uploads.js";

const authRoute = express.Router();
authRoute.post("/register", upload.single("profileUrl"), register);
authRoute.post("/login", login);
authRoute.post("/verify", verifyAccount);
authRoute.post("/user-verification", resetPasswordVerification);
authRoute.post("/reset-password", resetPassword);

export default authRoute;
