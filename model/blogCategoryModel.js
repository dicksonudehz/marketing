import mongoose from "mongoose";

// Declare the Schema of the Mongo model
var blogCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  { timeStamp: true }
);

//Export the model
const BlogCategory = mongoose.model("BlogCategory", blogCategorySchema);

export default BlogCategory;
