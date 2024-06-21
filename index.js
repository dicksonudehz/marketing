import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/dbconnect.js";
import authroute from "./route/authroute.js";
import productRoute from "./route/productRoute.js";
import blogRoute from "./route/blogRoute.js";
import prodCategoryRoute from "./route/prodCategoryRoute.js";
import blogCategoryRoute from "./route/blogCategoryRoute.js";
import brandRoute from "./route/brandRoute.js";
import couponRoute from "./route/couponRoute.js";
import cors from "cors";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";

dotenv.config();
connectDB();
dotenv.config();

const app = express();

const corsOptions = {
  origin: "http://localhost:5600", // Frontend origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Server running successfully");
});

app.use(morgan('dev'))
app.use("/api/user", authroute);
app.use("/api/product", productRoute);
app.use("/api/blog", blogRoute);
app.use("/api/category", prodCategoryRoute);
app.use("/api/blogcategory", blogCategoryRoute);
app.use("/api/brand", brandRoute);
app.use("/api/coupon", couponRoute);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});
