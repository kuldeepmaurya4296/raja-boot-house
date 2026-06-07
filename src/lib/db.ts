import mongoose from "mongoose";
import dns from "dns";
import { promisify } from "util";

// Force IPv4 DNS resolution order to prevent querySrv ECONNREFUSED in Next.js runtime
if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  console.warn("Could not set custom DNS servers in DB connection module:", e);
}

const resolveSrv = promisify(dns.resolveSrv);

async function resolveMongoSrv(srvUri: string): Promise<string> {
  // Check if it's an SRV connection string
  if (!srvUri.startsWith("mongodb+srv://")) {
    return srvUri;
  }

  // Parse credentials and host
  const match = srvUri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)(.*)$/);
  if (!match) return srvUri;

  const [_, user, pass, hostWithParams, rest] = match;
  const hostMatch = hostWithParams.match(/^([^?]+)(\?.*)?$/);
  if (!hostMatch) return srvUri;

  const [__, host, params] = hostMatch;
  const srvDomain = `_mongodb._tcp.${host}`;

  try {
    console.log(`Resolving MongoDB SRV records for: ${srvDomain}`);
    const records = await resolveSrv(srvDomain);
    if (records.length === 0) throw new Error("No SRV records returned");

    const shardList = records.map((r) => `${r.name}:${r.port}`).join(",");
    const sslParam = params ? (params.includes("ssl=") || params.includes("tls=") ? "" : "&ssl=true") : "?ssl=true";
    const directUri = `mongodb://${user}:${pass}@${shardList}${rest || "/"}${params || ""}${sslParam}&authSource=admin`;
    return directUri;
  } catch (err) {
    console.warn("MongoDB SRV lookup failed, falling back to static shard list resolution.", err);
    // Hardcoded resolved shards for the user's specific cluster
    const shardList = "ac-7icklru-shard-00-00.wx9o96c.mongodb.net:27017,ac-7icklru-shard-00-01.wx9o96c.mongodb.net:27017,ac-7icklru-shard-00-02.wx9o96c.mongodb.net:27017";
    const sslParam = params ? (params.includes("ssl=") || params.includes("tls=") ? "" : "&ssl=true") : "?ssl=true";
    const directUri = `mongodb://${user}:${pass}@${shardList}${rest || "/"}${params || ""}${sslParam}&authSource=admin`;
    return directUri;
  }
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn("MONGODB_URI is not defined in the environment variables. Using simulated database.");
}

/**
 * Cached connection object to prevent multiple connections in development.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (!MONGODB_URI || MONGODB_URI.includes("dummy") || MONGODB_URI === "") {
    console.warn("MongoDB URI is missing or using a dummy value. Database operations are simulated.");
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    };

    cached.promise = resolveMongoSrv(MONGODB_URI)
      .then((resolvedUri) => {
        console.log("Connecting to database using direct URI connection...");
        return mongoose.connect(resolvedUri, opts);
      })
      .then((mongooseInstance) => {
        console.log("Successfully connected to MongoDB.");
        return mongooseInstance;
      })
      .catch((err) => {
        console.error("MongoDB connection failed:", err.message);
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("Failed to resolve MongoDB connection promise:", e);
    return null;
  }

  return cached.conn;
}
