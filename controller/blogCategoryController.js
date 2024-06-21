import BlogCategory from "../model/blogCategoryModel.js";
import asyncHandler from "express-async-handler";
import validateUser from "../util/validateUser.js";

const createCategory = asyncHandler(async (req, res) => {
  try {
    const newCategory = await BlogCategory.create(req.body);
    res.json(newCategory);
  } catch (error) {
    throw new Error(error);
  }
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateUser(id);
  try {
    const updateCategory = await BlogCategory.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateCategory);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateUser(id);
  try {
    const deleteACategory = await BlogCategory.findByIdAndDelete(id);
    res.json(deleteACategory);
  } catch (error) {
    throw new Error(error);
  }
});

const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateUser(id);
  try {
    const getACategory = await BlogCategory.findById(id);
    res.json(getACategory);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllCategory = asyncHandler(async (req, res) => {
    try {
      const getAllCategory = await BlogCategory.find()
      res.json(getAllCategory);
    } catch (error) {
      throw new Error(error);
    }
  });

export { createCategory, updateCategory, deleteCategory, getCategory,getAllCategory };
