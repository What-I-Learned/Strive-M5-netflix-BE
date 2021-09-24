import path from "path";
import fs from "fs-extra";
import uniqid from "uniqid";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "netflix-strive",
  },
});
// const storage = multer.diskStorage({
//   destination: cloudinaryStorage,
//   fileFilter: function (req, file, cb) {
//     const ext = path.extname(file.originalname);
//     if (ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg") {
//       return callback(new Error("Only images are allowed"));
//     }
//     cb(null, true);
//   },
//   filename: function (req, file, cb) {
//     cb(null, uniqid() + path.extname(file.originalname));
//   },
// });
export const imageUpload = multer({ storage: cloudinaryStorage });
