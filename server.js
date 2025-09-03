import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/db/database.js";
import authRoute from "./routes/authroutes.js";
import userRouter from "./routes/userroutes.js";
import resourceRouter from "./routes/resourceroute.js";

dotenv.config();
//app
const app = express();

const PORT = process.env.PORT || 5000;
 


//s3 bucket
const bucketName = process.env.AWS_BUCKET_NAME;

//midddleware
app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoute);
app.use("/api/user", userRouter);
app.use("/api/resources", resourceRouter);
app.get("/", (req, res) => {
  res.send("server is ready to use");
});

//start server
app.listen(PORT, () => {
  connectDB();
  console.log(`server is running on ${PORT}`);
});
