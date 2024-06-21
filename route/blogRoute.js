import express from "express";
import {
  createBlog,
  deleteBlog,
  getAllBlog,
  getBlog,
  islikedBlog,
  likedBlog,
  updateBlog,
  uploadImages,
} from "../controller/blogController.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";
import { blogImageResize, uploadPhoto } from "../middleware/uploadImages.js";

const router = express.Router();

router.post("/", authMiddleware, isAdmin, createBlog);
router.put(
  "/upload/:id",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 10),
  blogImageResize,
  uploadImages
);
router.put("/likes", authMiddleware, likedBlog);
router.put("/dislikes", authMiddleware, islikedBlog);
router.put("/:id", authMiddleware, isAdmin, updateBlog);
router.get("/:id", getBlog);
router.get("/", getAllBlog);
router.delete("/:id", authMiddleware, isAdmin, deleteBlog);

export default router;
