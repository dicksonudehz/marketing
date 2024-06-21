import express from "express";
import {
  createUser,
  loginUser,
  getAllUser,
  getAUser,
  deleteAUser,
  updateAUser,
  blockedUser,
  unblockedUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgetPassword,
  resetPassword,
  loginAdmin,
  getWishList,
  saveAddress,
  userCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  createOrder,
  getOrders,
  updateOrderStatus,
} from "../controller/userController.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", createUser);
router.post("/forget-password-token", forgetPassword);
router.post("/reset-password token", resetPassword);
router.post("/login", loginUser);
router.post("/adminlogin", loginAdmin);
router.post("/cart/applycoupon", authMiddleware, applyCoupon);
router.post("/cart", authMiddleware, userCart);
router.post("/cart/cash-order", authMiddleware, createOrder);
router.get("/all-user", authMiddleware, getAllUser);
router.get("/cart", authMiddleware, getUserCart);
router.get("/get-orders", authMiddleware, getOrders);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.get("/wishlist", authMiddleware, getWishList);
router.get("/:id", authMiddleware, isAdmin, getAUser);
router.delete("/empty-cart", authMiddleware, emptyCart);
router.delete("/:id", deleteAUser);
router.put("/password", authMiddleware, updatePassword);
router.put(
  "/order/update-orders/:id",
  authMiddleware,
  isAdmin,
  updateOrderStatus
);
router.put("/save-address", authMiddleware, saveAddress);
router.put("/edit-user", authMiddleware, updateAUser);
router.put("/blocked/:id", authMiddleware, isAdmin, blockedUser);
router.put("/unblocked/:id", authMiddleware, isAdmin, unblockedUser);

export default router;
