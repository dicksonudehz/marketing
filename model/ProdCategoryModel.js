import mongoose from "mongoose";

// Declare the Schema of the Mongo model
var prodCategorySchema = new mongoose.Schema(
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
const ProdCategory = mongoose.model("ProdCategory", prodCategorySchema);

export default ProdCategory;
