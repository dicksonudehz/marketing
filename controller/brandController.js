import Brand from "../model/brandModel.js";
import asyncHandler from "express-async-handler";
import validateUser from "../util/validateUser.js";

const createbrand = asyncHandler(async (req, res) => {
  try {
    const newbrand = await Brand.create(req.body);
    res.json(newbrand);
  } catch (error) {
    throw new Error(error);
  }
});

const updatebrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateUser(id);
  try {
    const updatebrand = await Brand.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatebrand);
  } catch (error) {
    throw new Error(error);
  }
});

const deletebrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateUser(id);
  try {
    const deleteAbrand = await Brand.findByIdAndDelete(id);
    res.json(deleteAbrand);
  } catch (error) {
    throw new Error(error);
  }
});

const getbrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateUser(id);
  try {
    const getAbrand = await Brand.findById(id);
    res.json(getAbrand);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllbrand = asyncHandler(async (req, res) => {
    try {
      const getAllbrand = await Brand.find()
      res.json(getAllbrand);
    } catch (error) {
      throw new Error(error);
    }
  });

export { createbrand, updatebrand, deletebrand, getbrand,getAllbrand };
