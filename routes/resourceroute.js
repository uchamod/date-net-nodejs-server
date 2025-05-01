import express from "express";
import {
  getPreSingedUrl,
  saveMetaData,
} from "../controller/resourcecontroller.js";
const resourceRouter = express.Router();
//upload file
resourceRouter.post("/get-pre-signed-url", getPreSingedUrl);
resourceRouter.post("/save-metadata", saveMetaData);

//render file
export default resourceRouter;
