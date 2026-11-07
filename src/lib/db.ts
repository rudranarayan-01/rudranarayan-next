/* eslint-disable no-unused-vars */
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  bucket: GridFSBucket | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose ?? {
  conn: null,
  promise: null,
  bucket: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<{
  conn: typeof mongoose;
  bucket: GridFSBucket;
}> {
  if (cached.conn && cached.bucket) {
    return { conn: cached.conn, bucket: cached.bucket };
  }

  if (!cached.promise) {
    console.log("🔄 Connecting to MongoDB...");

    cached.promise = mongoose.connect(MONGODB_URI!, {
      dbName: "portfolio",
      family: 4,
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    cached.conn = await cached.promise;
    const db = cached.conn.connection.db;

    if (!db) {
      throw new Error("Database instance could not be initialized.");
    }

    // Initialize GridFS bucket for binary file/image storage
    cached.bucket = new GridFSBucket(db, { bucketName: "uploads" });

    console.log("✅ MongoDB Connected Successfully!");
    console.log("📦 Database:", db.databaseName);
    console.log("🗄️ GridFS Bucket 'uploads' ready for image storage.");

    return { conn: cached.conn, bucket: cached.bucket };
  } catch (error) {
    cached.promise = null;
    cached.bucket = null;

    console.error("❌ MongoDB Connection Error:", error);

    throw error;
  }
}

export default connectDB;
