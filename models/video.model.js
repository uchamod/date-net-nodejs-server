import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      default: "",
      trim: true,
    },
    tags: {
      type: [String],

      default: [],
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    likes: {
      type: [String],

      default: [],
    },
    disLikes: {
      type: [String],

      default: [],
    },
    comments: {
      type: [String],

      default: [],
    },
    processed: { type: Boolean, default: false },
    weblink: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true, //cratedAT and updatedAt
  }
);

const video = mongoose.model("video", videoSchema);
export default video;
