import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please set MONGODB_URI in .env.local");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache;
}

if (!global.mongooseCache) {
  global.mongooseCache = { conn: null, promise: null };
}

async function connectDB() {
  const cache = global.mongooseCache;
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false, maxPoolSize: 10 });
  }
  try {
    cache.conn = await cache.promise;
  } catch (e) {
    cache.promise = null;
    throw e;
  }
  return cache.conn;
}

export default connectDB;
