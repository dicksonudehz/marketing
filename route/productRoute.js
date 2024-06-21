import express from "express";
import {
  addToWishList,
  createProduct,
  deleteProduct,
  getAProduct,
  getAllProduct,
  rating,
  updateProduct,
  uploadImages,
} from "../controller/productController.js";
import { productImageResize, uploadPhoto } from "../middleware/uploadImages.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, isAdmin, createProduct);
router.put(
  "/upload/:id",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 10),
  productImageResize,
  uploadImages
);
router.get("/:id", getAProduct);
router.get("/", getAllProduct);
router.put("/rating", authMiddleware, rating);
router.put("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);
router.put("/", authMiddleware, addToWishList);

export default router;
