import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./db/database.js";
import authRoute from "./routes/authroutes.js";

dotenv.config();
//app
const app = express();

const PORT = process.env.PORT || 5000;

//midddleware
app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoute);
app.get("/", (req, res) => {
  res.send("server is ready to use");
});

//start server
app.listen(PORT, () => {
  connectDB();
  console.log(`server is running on ${PORT}`);
});
