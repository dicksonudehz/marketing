import jwt from "jsonwebtoken";

const generateRefreshTokens = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "3d" });
};
export { generateRefreshTokens };
