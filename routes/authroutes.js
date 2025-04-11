import express from "express";
import { login, register } from "../controller/userauthcontroller.js";
import upload from "../middleware/uploads.js";

const authRoute = express.Router();
authRoute.post("/register", upload.single("profileUrl"), register);
authRoute.post("/login", login);

export default authRoute;
