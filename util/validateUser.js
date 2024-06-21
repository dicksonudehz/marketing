import mongoose from "mongoose";
const validateUser = (id) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);
  if (!isValid) {
    throw new Error("Id is invalid or not found");
  }
};
export default validateUser;
