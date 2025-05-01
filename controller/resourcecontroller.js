import dotenv from "dotenv";
import s3 from "../config/aws/awsconfig.js";
import video from "../models/video.model.js";

dotenv.config();

const bucketName = process.env.AWS_BUCKET_NAME;
//get pre singed url
export const getPreSingedUrl = async (req, res) => {
  const { userId, fileType, filename } = req.body;
  if (!userId || !fileType || !filename) {
    return res.status(400).json({ success: false, message: "empty parameter" });
  }
  try {
    const key = `reel/${userId}/${filename}`;
    const params = {
      Bucket: `${bucketName}/user-reels`,
      Key: key,
      ContentType: fileType,
    };

    const uploadUrl = s3.getSignedUrl("putObject", params);

    if (!uploadUrl) {
      return res
        .status(400)
        .json({ success: false, message: "cannot get url" });
    }
    return res.status(200).json({
      success: true,
      data: {
        uploadUrl: uploadUrl,
        videokey: key,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: `${err}` });
  }
};
//save metadata
export const saveMetaData = async (req, res) => {
  const { userId, videoKey, title } = req.body;
  if (!userId || !videoKey || !title) {
    return res.status(400).json({ success: false, message: "empty parameter" });
  }
  try {
    const newVideo = new video({
      userId,
      title,
      url: videoKey,
    });
    const createdVideo =await newVideo.save();
    return res.status(200).json({
      success: true,
      data: {
        id: createdVideo._id,
        userId: createdVideo.userId,
        videokey: createdVideo.url,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: `${err}` });
  }
};
