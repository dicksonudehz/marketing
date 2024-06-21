import User from "../model/userModel.js";
import Product from "../model/productModel.js";
import Coupon from "../model/couponModel.js";
import Order from "../model/orderModel.js";
import Cart from "../model/cartModel.js";
import asyncHandler from "express-async-handler";
import { generateTokens } from "../config/jwtTokens.js";
import validateUser from "../util/validateUser.js";
import { generateRefreshTokens } from "../config/refreshToken.js";
import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";
import { sendMail } from "./emailController.js";
import crypto from "crypto";
import uniqid from "uniqid";

// create a user
const createUser = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const findUser = await User.findOne({ email });

  if (!findUser) {
    const newUser = await User.create(req.body);
    res.json({ message: "User Created Successfully", newUser });
  } else {
    throw new Error("user already exist");
  }
});

// create a user login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // Find user by email
  const findUser = await User.findOne({ email });
  // Check if user exists and password matches
  if (findUser && (await findUser.isPasswordMatched(password))) {
    // Generate refresh token
    const refreshToken = await generateRefreshTokens(findUser._id);
    // Update user with new refresh token
    const updateUser = await User.findByIdAndUpdate(
      findUser._id,
      { refreshToken },
      { new: true }
    );
    // Set refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000, // 3 days
    });
    // Respond with user details and JWT token
    res.json({
      id: findUser._id,
      firstname: findUser.firstname,
      lastname: findUser.lastname,
      email: findUser.email,
      mobile: findUser.mobile,
      token: generateTokens(findUser._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid credentials");
  }
});

// create a admin login
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // Find user by email
  const findAdmin = await User.findOne({ email });
  if (findAdmin.role !== "admin") throw new Error("!Not authorised");
  // Check if user exists and password matches
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    // Generate refresh token
    const refreshToken = await generateRefreshTokens(findAdmin._id);
    // Update user with new refresh token
    const updateAdmin = await User.findByIdAndUpdate(
      findAdmin._id,
      { refreshToken },
      { new: true }
    );
    // Set refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000, // 3 days
    });
    // Respond with user details and JWT token
    res.json({
      id: findAdmin._id,
      firstname: findAdmin.firstname,
      lastname: findAdmin.lastname,
      email: findAdmin.email,
      mobile: findAdmin.mobile,
      token: generateTokens(findAdmin._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid credentials");
  }
});

// handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("no refresh token in cookie");
  const refreshToken = cookie.refreshToken;
  console.log("refreshToken", refreshToken);
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error(" no refresh token in the db or not match");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("something is wrong with the refresh token");
    }
    const accessToken = generateTokens(user?._id);
    res.json({ accessToken });
  });
  res.json(user);
});

// logout user function
const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("no refresh token in cookie");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204);
  }
  await User.findOneAndUpdate(
    { refreshToken },
    {
      refreshToken: "",
    }
  );
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204);
});

// save user address
const saveAddress = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  validateUser(_id);
  try {
    const addressSave = await User.findByIdAndUpdate(
      _id,
      {
        address: req.body?.address,
      },
      {
        new: true,
      }
    );
    res.json(addressSave);
  } catch (error) {
    throw new Error(error);
  }
});
// get all usder in the database
const getAllUser = asyncHandler(async (req, res) => {
  try {
    const getUser = await User.find();
    res.json({ message: "All User Fetched Successfully", getUser });
  } catch (err) {
    throw new Error(err);
  }
});

// get a user
const getAUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    validateUser(id);
    const getUser = await User.findById(id);
    if (getUser) {
      res.status(200).json({ message: "User found", user: getUser });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    throw new Error(err);
  }
});

// delete a user
const deleteAUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    validateUser(id);
    const deleteAUser = await User.findByIdAndDelete(id);
    if (deleteAUser) {
      res
        .status(200)
        .json({ message: "User delete successful", user: deleteAUser });
    } else {
      res.status(404).json({ message: "User cannot be deleted" });
    }
  } catch (err) {
    throw new Error(err);
  }
});

// update a user
const updateAUser = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    validateUser(_id);
    const updateUser = await User.findByIdAndUpdate(
      _id,
      {
        firstname: req.body?.firstname,
        lastname: req.body?.lastname,
        email: req.body?.email,
        mobile: req.body?.mobile,
      },
      {
        new: true,
      }
    );
    res
      .status(200)
      .json({ message: "User updated successful", updatedUser: updateUser });
  } catch (err) {
    throw new Error(err);
  }
});

const blockedUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    validateUser(id);
    const blockedUser = await User.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "This user is blocked", blockedUser: blockedUser });
  } catch (error) {
    throw new Error(error);
  }
});

const unblockedUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    validateUser(id);
    const blockedUser = await User.findByIdAndUpdate(
      id,
      { isBlocked: false },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "This user is unblocked", blockedUser: blockedUser });
  } catch (error) {
    throw new Error(error);
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateUser(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});

const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("user cannot be found with this email");
  } else {
    try {
      const token = await user.createPasswordResetToken();
      await user.save();
      const resetURL = `please follow this link to reset your password, this link last for 10 minutes <a href='http://localhost:5600/api/user/reset-password/${token}'>Click Here</a>`;
      const data = {
        to: email,
        text: "hey user",
        subject: "forget password reset link",
        htm: resetURL,
      };
      sendMail(data);
      res.json(token);
    } catch (error) {
      throw new Error(error);
    }
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $sg: Date.now() },
  });
  if (!user) throw new Error("token expires");
  (user.password = password),
    (user.passwordResetToken = undefined),
    (user.passwordResetExpires = undefined);
  await user.save();
  res.json(user);
});

const getWishList = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const findWishList = await User.findById(_id).populate("wishList");
    res.json(findWishList);
  } catch (error) {
    throw new Error(error);
  }
});

const userCart = asyncHandler(async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;
  validateUser(_id);
  try {
    if (!cart || !Array.isArray(cart)) {
      return res
        .status(400)
        .json({ message: "Cart is missing or not an array" });
    }

    const products = [];
    const user = await User.findById(_id);
    const alreadyExitCart = await Cart.findOne({ orderBy: user._id });

    if (alreadyExitCart) {
      await alreadyExitCart.deleteOne();
      console.log("Item removed from cart");
    }
    for (let i = 0; i < cart.length; i++) {
      if (!cart[i]._id) {
        console.error(`Cart item at index ${i} is missing _id:`, cart[i]);
        return res
          .status(400)
          .json({ message: `Cart item at index ${i} is missing _id` });
      }

      let object = {};
      object.product = cart[i]._id;
      object.count = cart[i].count;
      object.color = cart[i].color;

      const getPrice = await Product.findById(cart[i]._id)
        .select("price")
        .exec();
      if (!getPrice) {
        console.error(`Product with ID ${cart[i]._id} not found.`);
        return res
          .status(404)
          .json({ message: `Product with ID ${cart[i]._id} not found` });
      }

      object.price = getPrice.price;
      products.push(object);
    }

    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      cartTotal += products[i].price * products[i].count;
    }

    console.log("Products:", products);
    console.log("Cart Total:", cartTotal);

    // Create a new cart
    const newCart = await Cart.create({
      products,
      cartTotal,
      orderBy: user._id,
    });

    res.json(newCart); // Send response back to the client
  } catch (error) {
    console.error("Error processing user cart:", error); // Log the error
    res.status(500).json({ message: error.message }); // Send error response to client
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateUser(_id);
  try {
    const cart = await Cart.findOne({ orderBy: _id }).populate(
      "products.product"
    );
    res.json(cart);
  } catch (error) {
    console.error("Error retrieving user cart:", error); // Log the error
    res.status(500).json({ message: error.message }); // Send error response to client
  }
});

const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateUser(_id);
  try {
    const user = await User.findOne(_id);
    const cart = await Cart.findOneAndDelete({ orderBy: user._id });
    res.json(cart);
  } catch (error) {
    console.error("Error retrieving user cart:", error); // Log the error
    res.status(500).json({ message: error.message }); // Send error response to client
  }
});

const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  validateUser(_id);
  const validCoupon = await Coupon.findOne({ name: coupon });
  console.log(validCoupon);
  // if (validCoupon === null) {
  //   throw new Error("invalid coupon");
  // }
  const user = await User.findOne({ _id });
  let {  cartTotal } = await Cart.findOne({
    orderBy: user._id,
  }).populate("products.product");
  let totalAfterDiscount = (
    cartTotal -
    (cartTotal * validCoupon.discount) / 100).toFixed(2);
  await Cart.findOneAndUpdate(
    { orderBy: user._id },
    { totalAfterDiscount },
    { new: true }
  );
  res.json(totalAfterDiscount);
});


const createOrder = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { COD, couponApplied } = req.body;
  validateUser(_id);
  try {
    if (!COD) throw new Error("create cash order failed");
    const user = await User.findById(_id);
    let userCart = await Cart.findOne({ orderBy: user._id });
    let finalAmount = 0;
    if (couponApplied && userCart.totalAfterDiscount) {
      finalAmount = userCart.totalAfterDiscount;
    } else {
      finalAmount = userCart.cartTotal;
    }
    let newOrder = await new Order({
      products: userCart.products,
      paymentIntent: {
        id: uniqid(),
        method: "COD",
        amount: finalAmount,
        status: "Cash on delivery",
        created: Date.now(),
        currency: "usd",
      },
      orderBy: user._id,
      orderStatus: "Cash on delivery",
    }).save();
    let update = userCart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      };
    });
    const updated = await Product.bulkWrite(update, {});
    res.json({ message: "success" });
  } catch (error) {
    throw new Error(error);
  }
});

const getOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateUser(_id);
  try {
    const userOrders = await Order.findOne({ orderBy: _id })
      .populate("products.product")
      .exec();
    res.json(userOrders);
  } catch (error) {
    throw new Error(error);
  }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  validateUser(id);
  try {
    const updateOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
        paymentIntent: {
          status: status,
        },
      },
      { new: true }
    );
    res.json(updateOrderStatus);
  } catch (error) {
    throw new Error(error);
  }
});

export {
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
};
