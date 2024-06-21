import asyncHandler from "express-async-handler";
import validateUser from "../util/validateUser.js";
import Coupon from "../model/couponModel.js";

const createCoupon = asyncHandler(async (req, res) => {
  try {
    const newCoupon = await Coupon.create(req.body);
    res.json(newCoupon);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllCoupon = asyncHandler(async (req, res) => {
  try {
    const allCoupon = await Coupon.find();
    res.json(allCoupon);
  } catch (error) {
    throw new Error(error);
  }
});

const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateUser(id);
  try {
    const updateACoupon = await Coupon.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateACoupon);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteACoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateUser(id);
  try {
    const deleteACoupon = await Coupon.findByIdAndDelete(id);
    res.json(deleteACoupon);
  } catch (error) {
    throw new Error(error);
  }
});

export { createCoupon, getAllCoupon, updateCoupon, deleteACoupon };
