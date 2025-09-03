import dotenv from "dotenv";
import s3 from "../config/aws/awsconfig.js";
import video from "../models/video.model.js";

dotenv.config();
//s3 bucket
const bucketName = process.env.AWS_BUCKET_NAME;

//cloudfront url
const cloudFront = process.env.CLOUDFRONT_URL;
//get pre singed url
export const getPreSingedUrl = async (req, res) => {
  const { userId, fileType, filename } = req.body;
  if (!userId || !fileType || !filename) {
    return res.status(400).json({ success: false, message: "empty parameter" });
  }
  try {
    const key = `reels/${userId}/${filename}`;
    const params = {
      Bucket: `${bucketName}`,
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
    const createdVideo = await newVideo.save();
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
//fetch all video data using cloudfront url
export const fetchVideoData = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const skip = (page - 1) * limit;
  try {
    const videos = await video
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    if (!videos) {
      return res
        .status(404)
        .json({ success: false, message: "data not found" });
    }
    const allVideos = videos.map((video) => ({
      reelId: video._id,
      userId: video.userId,
      title: video.title,
      url: `${cloudFront}/${video.url}`,
      joinedDate: video.createdAt,
      updatedDate: video.updatedAt,
      processed: video.processed,
      weblink: video.weblink,
      likes: video.likes,
      disLikes: video.disLikes,
      comments: video.comments,
      tags: video.tags,
    }));

    return res.status(200).json({ success: true, data: { videos: allVideos } });
  } catch (err) {
    return res.status(500).json({ success: false, message: `${err}` });
  }
};
//like reels
export const likeReels = async (req, res) => {
  const { userId, reelId } = req.body;

  if (!userId || !reelId) {
    return res
      .status(400)
      .json({ success: false, message: "invalid credientials" });
  }

  try {
    const reel = await video.findById(reelId);
    if (!reel) {
      return res
        .status(404)
        .json({ success: false, message: "reel not found" });
    }
    //check if like or not
    const isLiked = reel.likes.includes(userId);
    if (isLiked) {
      //remove userid if already liked
      reel.likes = reel.likes.filter((id) => id !== userId);
    } else {
      //add new like
      reel.likes.push(userId);
    }

    const updatedReel = await reel.save();``
    return res.status(200).json({
      success: true,
      data: {
        reel: updatedReel,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: `${err}` });
  }
};
//dislike reels
export const dislikeReels = async (req, res) => {
  const { userId, reelId } = req.body;

  if (!userId || !reelId) {
    return res
      .status(400)
      .json({ success: false, message: "invalid credientials" });
  }

  try {
    const reel = await video.findById(reelId);
    if (!reel) {
      return res
        .status(404)
        .json({ success: false, message: "reel not found" });
    }
    //check if like or not
    const isdisLiked = reel.disLikes.includes(userId);
    if (isdisLiked) {
      //remove userid if already liked
      reel.disLikes = reel.disLikes.filter((id) => id !== userId);
    } else {
      //add new like
      reel.disLikes.push(userId);
    }

    const updatedReel = await reel.save();
    return res.status(200).json({
      success: true,
      data: {
        reel: updatedReel,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: `${err}` });
  }
};
