import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
if (!uri) throw new Error("MONGODB_URI missing in environment");

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: Promise<MongoClient> | undefined;
}

export const mongoClientPromise =
  global._mongoClient ??
  (global._mongoClient = (async () => {
    const client = new MongoClient(uri, { maxPoolSize: 10 });
    return client.connect();
  })());
