import mongoose from "mongoose";

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        color: String,
        count: Number,
      },
    ],
    paymentIntent: {},
    orderStatus: {
      type: String,
      default: "Not Processed",
      enum: [
        "Not processed",
        "Cash on delivery",
        "processing",
        "Dispatched",
        "Cancelled",
        "delivered ",
      ],
    },
    orderBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

//Export the model
const Order = mongoose.model("Order", orderSchema);
export default Order;
