import mongoose from "mongoose";
import config from "./config";

const connectToDatabase = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    if (error instanceof Error) {
      console.error("MongoDB connection failed:", error.message);
    } else {
      console.error("Unknown error during MongoDB connection");
    }

    process.exit(1);
  }
};

export default connectToDatabase;
