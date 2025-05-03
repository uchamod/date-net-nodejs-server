import express from "express";
import {
  dislikeReels,
  fetchVideoData,
  getPreSingedUrl,
  likeReels,
  saveMetaData,
} from "../controller/resourcecontroller.js";
const resourceRouter = express.Router();
//upload file
resourceRouter.post("/get-pre-signed-url", getPreSingedUrl);
resourceRouter.post("/save-metadata", saveMetaData);
resourceRouter.get("/fetch-videos", fetchVideoData);
resourceRouter.post("/like-videos", likeReels);
resourceRouter.post("/dislike-videos", dislikeReels);

//render file
export default resourceRouter;
