import mongose from "mongoose";

export const connectDB = async () => {
  try {
    await mongose.connect(process.env.MONGODB_URI);
    console.log("mongo db connected");
  } catch (err) {
    console.log(`db not connected ${err}`);
    process.exit(1);
  }
};
