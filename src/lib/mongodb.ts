import mongoose from 'mongoose';
import dns from 'node:dns';

// Fix Windows & ISP DNS resolution failure (getaddrinfo ENOTFOUND) for MongoDB Atlas SRV/shard hostnames
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4', '1.0.0.1']);
} catch {
  // Ignore in sandboxed or restricted environments
}

const PRIMARY_URI = process.env.MONGODB_URI || 'mongodb+srv://mykotresh_db_user:ROSTZ9GaDGOqjmaV@cluster0.0bnasia.mongodb.net/happypocket?appName=Cluster0';

// Direct non-SRV replicaSet fallback string if SRV DNS lookup fails
const DIRECT_REPLICA_URI = process.env.MONGODB_DIRECT_URI || 'mongodb://mykotresh_db_user:ROSTZ9GaDGOqjmaV@ac-nhmutkc-shard-00-00.0bnasia.mongodb.net:27017,ac-nhmutkc-shard-00-01.0bnasia.mongodb.net:27017,ac-nhmutkc-shard-00-02.0bnasia.mongodb.net:27017/happypocket?ssl=true&replicaSet=atlas-jn4t40-shard-0&authSource=admin&retryWrites=true&w=majority';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

const connectionOptions: mongoose.ConnectOptions = {
  bufferCommands: false,
  serverSelectionTimeoutMS: 6000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4, // Force IPv4 to avoid Windows IPv6 DNS ENOTFOUND delays
};

export async function connectToDatabase(): Promise<typeof mongoose> {
  // Check if existing connection is still healthy (readyState: 1 = connected)
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = (async () => {
      try {
        // 1. Try Primary SRV Connection URI
        const instance = await mongoose.connect(PRIMARY_URI, connectionOptions);
        return instance;
      } catch (err: any) {
        console.warn('MongoDB primary SRV connection failed (' + (err?.message || 'ENOTFOUND') + '). Attempting direct replicaSet connection...');
        try {
          // 2. Fallback to Direct ReplicaSet Connection URI
          const instance = await mongoose.connect(DIRECT_REPLICA_URI, connectionOptions);
          console.log('MongoDB connected via direct replicaSet fallback!');
          return instance;
        } catch (fallbackErr: any) {
          console.error('MongoDB direct fallback also failed:', fallbackErr?.message);
          throw fallbackErr;
        }
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    throw e;
  }

  return cached.conn;
}

export function isDbConnected(): boolean {
  return !!cached.conn && cached.conn.connection.readyState === 1;
}
