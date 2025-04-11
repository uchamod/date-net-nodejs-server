import mongoose from "mongoose";
//user model
const UserSchema = new mongoose.Schema(
  {
    profileUrl: {
      type: String,

      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    isCreator: {
      type: Boolean,
      default: false,
    },
    serviceDiscription: {
      type: String,
      default: "",
      trim: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },

    followers: {
      type: [String],
      default: [],
    },
    following: {
      type: [String],
      default: [],
    },

    contact: {
      type: Number,
      default:0,
      trim: true,
    },
    referenceUrl: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true, //cratedAT and updatedAt
  }
);

const User = mongoose.model("User", UserSchema);
export default User;
