import Product from "../model/productModel.js";
import User from "../model/userModel.js";
import asyncHandler from "express-async-handler";
import slugify from "slugify";
import validateUser from "../util/validateUser.js";
import { cloudianryuploadImg } from "../util/cloudinary.js";
import fs from "fs";

// create a product
const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);
    if (newProduct) {
      res.json({ message: "product Created Successfully", newProduct });
    } else {
      res
        .status(204)
        .json({ message: "product cannot be created Successfully" });
    }
  } catch (err) {
    throw new Error("error in creating product");
  }
});

// update a product
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title, { lower: true, strict: true });
    }
    const productUpdate = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (productUpdate) {
      res.json(productUpdate);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error updating product details" });
  }
});

// delete a product
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateUser(id);
  try {
    const productDelete = await Product.findByIdAndDelete(id);
    if (productDelete) {
      res.json({
        message: "Product deleted successfully",
        product: productDelete,
      });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error deleting product details" });
  }
});

// get a product
const getAProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (product) {
      res.status(200).json({ message: "product fetch Successfully", product });
    } else {
      res.status(204).json({ message: "Product not available" });
    }
  } catch (err) {
    throw new Error("product not available");
  }
});

// get all product

const getAllProduct = asyncHandler(async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    let query = Product.find(JSON.parse(queryStr));

    //this is sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) {
        throw new Error("this page does not exist");
      }
    }

    const product = await query;
    // const allProduct = await Product.find(queryObj);
    if (product) {
      res
        .status(200)
        .json({ message: "All Product Fetch Successfully", product });
    } else {
      res.status(204).json({ message: "No Product is available" });
    }
  } catch (err) {
    throw new Error(err);
  }
});

const addToWishList = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { prodId } = req.body;

  try {
    const user = await User.findById(_id);
    const alreadyAdded = user.wishList.includes(prodId);

    if (alreadyAdded) {
      const updatedUser = await User.findByIdAndUpdate(
        _id,
        {
          $pull: { wishList: prodId },
        },
        { new: true }
      );
      res.json({ message: "Product removed from wishlist", user: updatedUser });
    } else {
      const updatedUser = await User.findByIdAndUpdate(
        _id,
        {
          $push: { wishList: prodId },
        },
        { new: true }
      );
      res.json({ message: "Product added to wishlist", user: updatedUser });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating wishlist", error: error.message });
  }
});

const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, prodId, comment } = req.body;
  try {
    const product = await Product.findById(prodId);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    const alreadyRated = product.rating.find(
      (rating) => rating.postedBy.toString() === _id.toString()
    );

    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        { _id: prodId, "rating.postedBy": _id },
        { $set: { "rating.$.star": star, "rating.$.comment": comment } },
        { new: true }
      );
    } else {
      updateRating = await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            rating: { star: star, comment: comment, postedBy: _id },
          },
        },
        { new: true }
      );
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating rating", error: error.message });
  }
  const updatedProduct = await Product.findById(prodId);
  const totalRatings = updatedProduct.rating.length;
  const ratingSum = updatedProduct.rating
    .map((item) => item.star)
    .reduce((prev, curr) => prev + curr, 0);
  const actualRating = Math.round(ratingSum / totalRatings);

  const finalProduct = await Product.findByIdAndUpdate(
    prodId,
    { totalRating: actualRating },
    { new: true }
  );
  res.json(finalProduct);
});

const uploadImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(req.files);
  validateUser(id);
  try {
    const uploader = (path) => cloudianryuploadImg(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      console.log(newPath);
      urls.push(newPath);
      fs.unlinkSync(path);
    }
    const findProduct = await Product.findByIdAndUpdate(
      id,
      {
        images: urls.map((file) => {
          return file;
        }),
      },
      { new: true }
    );
    res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
});

export {
  createProduct,
  getAProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishList,
  rating,
  uploadImages,
};
