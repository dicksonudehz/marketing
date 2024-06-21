import Blog from "../model/blogModel.js";
import asyncHandler from "express-async-handler";
import validateUser from "../util/validateUser.js";
import { cloudianryuploadImg } from "../util/cloudinary.js";
import fs from "fs"

const createBlog = asyncHandler(async (req, res) => {
  try {
    const newBlog = await Blog.create(req.body);
    res.json({
      status: 200,
      newBlog,
    });
  } catch (err) {
    throw new Error(err);
  }
});

const updateBlog = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  validateUser(_id);
  try {
    const newBlog = await Blog.findOneAndUpdate(_id, req.body, { new: true });
    res.json({
      status: 200,
      newBlog,
    });
  } catch (err) {
    throw new Error(err);
  }
});

const getBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateUser(id);
  try {
    const getABlog = await Blog.findById(id)
      .populate("likes")
      .populate("disLikes");
    const updateViews = await Blog.findByIdAndUpdate(
      id,
      {
        $inc: { numberView: 1 },
      },
      { new: true }
    );
    res.json({
      status: 200,
      getABlog,
      updateViews,
    });
  } catch (err) {
    throw new Error(err);
  }
});

const getAllBlog = asyncHandler(async (req, res) => {
  try {
    const getABlog = await Blog.find();

    res.json({
      status: 200,
      getABlog,
    });
  } catch (err) {
    throw new Error(err);
  }
});

const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateUser(id);
  try {
    const deleteABlog = await Blog.findByIdAndDelete(id);
    res.json({
      status: 200,
      deleteABlog,
    });
  } catch (err) {
    throw new Error(err);
  }
});

const likedBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  validateUser(blogId);
  try {
    //find the blog you want to like
    const blog = await Blog.findById(blogId);
    //find the user that want to liked the blog
    const loginUserId = await req?.user?._id;
    //has the user disLiked the blog before now ??
    const isliked = blog?.isLiked;
    //find if the user has disliked the blog
    const alreadyDisliked = blog?.disLikes.find(
      (userId) => userId?.toString() === loginUserId?.toString()
    );
    if (alreadyDisliked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { disLikes: loginUserId },
          disLiked: false,
        },
        { new: true }
      );
      res.json({
        status: 200,
        blog,
      });
    }
    if (isliked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { likes: loginUserId },
          isLiked: false,
        },
        { new: true }
      );
      res.json({
        status: 200,
        blog,
      });
    } else {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $push: { likes: loginUserId },
          isLiked: true,
        },
        { new: true }
      );
      res.json({
        status: 200,
        blog,
      });
    }
  } catch (err) {
    throw new Error(err);
  }
});

const islikedBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  validateUser(blogId);
  try {
    //find the blog you want to like
    const blog = await Blog.findById(blogId);
    //find the user that want to liked the blog
    const loginUserId = await req?.user?._id;
    //has the user disLiked the blog before now ??
    const isDisliked = blog?.isDisLiked;
    //find if the user has disliked the blog
    const alreadyliked = blog?.likes.find(
      (userId) => userId?.toString() === loginUserId?.toString()
    );
    if (alreadyliked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { likes: loginUserId },
          isLiked: false,
        },
        { new: true }
      );
      res.json({
        status: 200,
        blog,
      });
    }
    if (isDisliked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { disLikes: loginUserId },
          isDisLiked: false,
        },
        { new: true }
      );
      res.json({
        status: 200,
        blog,
      });
    } else {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $push: { disLikes: loginUserId },
          isDisLiked: true,
        },
        { new: true }
      );
      res.json({
        status: 200,
        blog,
      });
    }
  } catch (err) {
    throw new Error(err);
  }
});

const uploadImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateUser(id);
  try {
    const uploader = (path) =>  cloudianryuploadImg(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      console.log(newPath);
      urls.push(newPath);
      fs.unlinkSync(path)
    }
    const findBlog = await Blog.findByIdAndUpdate(
         id,
      { images: urls.map((file) =>{
        return file
      }) },
      { new: true }
    );
    res.json(findBlog);
  } catch (error) {
    throw new Error(error);
  } 
});

export {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlog,
  deleteBlog,
  likedBlog,
  islikedBlog,
  uploadImages,
};
