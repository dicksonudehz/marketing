import express from "express";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";
import {
  createbrand,
  deletebrand,
  getAllbrand,
  getbrand,
  updatebrand,
} from "../controller/brandController.js";

const router = express.Router();

router.post("/", authMiddleware, isAdmin, createbrand);
router.put("/:id", authMiddleware, isAdmin, updatebrand);
router.delete("/:id", authMiddleware, isAdmin, deletebrand);
router.get("/:id", getbrand);
router.get("/", getAllbrand);

export default router;
