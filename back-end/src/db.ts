import mongoose from "mongoose";

export async function connectDB(uri: string) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });
  console.log("✅ MongoDB connected:", mongoose.connection.host);
  mongoose.connection.on("disconnected", () =>
    console.warn("⚠️  MongoDB disconnected")
  );
}
