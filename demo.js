// // server.js (Express.js with MongoDB and AWS S3)
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const AWS = require('aws-sdk');
// const { v4: uuidv4 } = require('uuid');
// const ffmpeg = require('fluent-ffmpeg');
// const fs = require('fs');
// const path = require('path');

// const app = express();
// app.use(express.json());
// app.use(cors());

// // MongoDB Connection (can be Atlas for even more scalability)
// const mongoURI = 'mongodb://localhost:27017/videoApp';
// mongoose.connect(mongoURI);

// // Configure AWS
// AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION || 'us-east-1'
// });

// const s3 = new AWS.S3();
// const cloudfront = new AWS.CloudFront();

// // S3 bucket name
// const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'your-video-bucket';
// // CloudFront distribution domain
// const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL || 'https://your-distribution.cloudfront.net';

// // Video Schema
// const videoSchema = new mongoose.Schema({
//   userId: { type: String, required: true },
//   videoKey: { type: String, required: true }, // S3 key
//   thumbnailKey: { type: String }, // S3 key for thumbnail
//   description: { type: String, required: true },
//   likesCount: { type: Number, default: 0 },
//   commentsCount: { type: Number, default: 0 },
//   sharesCount: { type: Number, default: 0 },
//   processed: { type: Boolean, default: false },
//   createdAt: { type: Date, default: Date.now }
// });

// const Video = mongoose.model('Video', videoSchema);

// // Routes
// // Generate pre-signed URL for direct S3 upload
// app.post('/api/videos/get-upload-url', async (req, res) => {
//   try {
//     const { userId, fileType, fileName } = req.body;
//     const key = `videos/${userId}/${uuidv4()}-${fileName}`;
    
//     const params = {
//       Bucket: BUCKET_NAME,
//       Key: key,
//       ContentType: fileType,
//       Expires: 300 // URL expires in 5 minutes
//     };
    
//     const uploadUrl = s3.getSignedUrl('putObject', params);
    
//     res.json({
//       uploadUrl,
//       key
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error generating upload URL', error: error.message });
//   }
// });

// // Save video metadata after upload
// app.post('/api/videos/metadata', async (req, res) => {
//   try {
//     const { userId, videoKey, description } = req.body;
    
//     // Generate a thumbnail key
//     const thumbnailKey = videoKey.replace('videos/', 'thumbnails/').replace(/\.[^/.]+$/, '.jpg');
    
//     // Create the video record in MongoDB
//     const newVideo = new Video({
//       userId,
//       videoKey,
//       thumbnailKey,
//       description
//     });
    
//     await newVideo.save();
    
//     // Trigger thumbnail generation and video processing (async)
//     generateThumbnail(videoKey, thumbnailKey, newVideo._id);
    
//     res.status(201).json({ 
//       message: 'Video metadata saved successfully', 
//       videoId: newVideo._id 
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error saving video metadata', error: error.message });
//   }
// });

// // Get videos for feed
// app.get('/api/videos', async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;
    
//     // Only return processed videos (with thumbnails)
//     const videos = await Video.find({ processed: true })
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);
      
//     // Transform data to include CloudFront URLs
//     const videoData = videos.map(video => ({
//       _id: video._id,
//       userId: video.userId,
//       videoUrl: `${CLOUDFRONT_URL}/${video.videoKey}`,
//       thumbnailUrl: `${CLOUDFRONT_URL}/${video.thumbnailKey}`,
//       videoKey: video.videoKey,
//       description: video.description,
//       likesCount: video.likesCount,
//       commentsCount: video.commentsCount,
//       sharesCount: video.sharesCount,
//       createdAt: video.createdAt
//     }));
    
//     res.json({ data: videoData });
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching videos', error: error.message });
//   }
// });

// // Like/unlike video
// app.post('/api/videos/:id/like', async (req, res) => {
//   try {
//     const video = await Video.findById(req.params.id);
//     if (!video) {
//       return res.status(404).json({ message: 'Video not found' });
//     }
    
//     // In a real app, you'd check if user has already liked and toggle
//     video.likesCount += 1;
//     await video.save();
    
//     res.json({ message: 'Like toggled successfully', likesCount: video.likesCount });
//   } catch (error) {
//     res.status(500).json({ message: 'Error toggling like', error: error.message });
//   }
// });

// // Function to generate a thumbnail from video
// async function generateThumbnail(videoKey, thumbnailKey, videoId) {
//   try {
//     // Create temp directory if it doesn't exist
//     const tempDir = path.join(__dirname, 'temp');
//     if (!fs.existsSync(tempDir)) {
//       fs.mkdirSync(tempDir);
//     }
    
//     // Download video from S3 to temp location
//     const videoPath = path.join(tempDir, `video-${uuidv4()}.mp4`);
//     const thumbnailPath = path.join(tempDir, `thumbnail-${uuidv4()}.jpg`);
    
//     const videoObject = await s3.getObject({
//       Bucket: BUCKET_NAME,
//       Key: videoKey
//     }).promise();
    
//     fs.writeFileSync(videoPath, videoObject.Body);
    
//     // Use ffmpeg to generate thumbnail
//     await new Promise((resolve, reject) => {
//       ffmpeg(videoPath)
//         .on('end', resolve)
//         .on('error', reject)
//         .screenshots({
//           timestamps: ['00:00:01.000'],
//           filename: path.basename(thumbnailPath),
//           folder: path.dirname(thumbnailPath),
//           size: '320x240'
//         });
//     });
    
//     // Upload thumbnail to S3
//     await s3.putObject({
//       Bucket: BUCKET_NAME,
//       Key: thumbnailKey,
//       Body: fs.readFileSync(thumbnailPath),
//       ContentType: 'image/jpeg'
//     }).promise();
    
//     // Update video record as processed
//     await Video.findByIdAndUpdate(videoId, { processed: true });
    
//     // Clean up temporary files
//     fs.unlinkSync(videoPath);
//     fs.unlinkSync(thumbnailPath);
//   } catch (error) {
//     console.error('Error generating thumbnail:', error);
//   }
// }

// // Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// // ----- AWS EC2 Deployment Guide -----
// // 1. Launch an EC2 instance (t2.medium or better recommended for video processing)
// // 2. Set up security groups to allow HTTP/HTTPS traffic
// // 3. Install Node.js, MongoDB, and FFmpeg on the instance:
// //    $ sudo apt update
// //    $ sudo apt install -y nodejs npm mongodb ffmpeg
// //    $ sudo systemctl enable mongodb
// //    $ sudo systemctl start mongodb
// // 4. Set up PM2 for process management:
// //    $ sudo npm install -g pm2
// // 5. Clone your repo and install dependencies:
// //    $ git clone your-repo-url
// //    $ cd your-app
// //    $ npm install
// // 6. Set environment variables:
// //    $ export AWS_ACCESS_KEY_ID=your-access-key
// //    $ export AWS_SECRET_ACCESS_KEY=your-secret-key
// //    $ export AWS_REGION=your-region
// //    $ export S3_BUCKET_NAME=your-bucket
// //    $ export CLOUDFRONT_URL=your-distribution-url
// // 7. Start with PM2:
// //    $ pm2 start server.js
// //    $ pm2 startup
// //    $ pm2 save
// // 8. Set up Nginx as a reverse proxy (optional)


// // --- Main App Entry Point ---
