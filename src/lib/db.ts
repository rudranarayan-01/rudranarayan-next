import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose ?? {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("🔄 Connecting to MongoDB...");

    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "portfolio",
      family: 4,
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    cached.conn = await cached.promise;

    console.log("✅ MongoDB Connected Successfully!");
    console.log(
      "📦 Database:",
      cached.conn.connection.db?.databaseName
    );

    return cached.conn;
  } catch (error) {
    cached.promise = null;

    console.error("❌ MongoDB Connection Error:", error);

    throw error;
  }
}

export default connectDB;