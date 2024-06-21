import jwt from "jsonwebtoken";

const generateTokens = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "3d" });
};
export { generateTokens };
