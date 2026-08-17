import mongoose from "mongoose";

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required");
  if (uri.includes("cluster.mongodb.net") || uri.includes("USER:PASSWORD")) {
    throw new Error(
      "MONGODB_URI still contains the placeholder Atlas URL. Replace it with your real MongoDB connection string in backend/.env.",
    );
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    autoIndex: process.env.NODE_ENV !== "production",
  });
}
