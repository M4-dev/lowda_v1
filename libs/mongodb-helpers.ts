import { MongoClient, ObjectId, Document } from "mongodb";

const DATABASE_NAME = "millionare-ecom-lifeplan";

export async function withMongo<T>(
  callback: (db: any) => Promise<T>
): Promise<T> {
  const client = new MongoClient(process.env.DATABASE_URL!);
  await client.connect();
  try {
    const db = client.db(DATABASE_NAME);
    return await callback(db);
  } finally {
    await client.close();
  }
}

export async function createDocument(
  collection: string,
  data: any
): Promise<any> {
  return withMongo(async (db) => {
    const now = new Date();
    const doc = {
      _id: new ObjectId(),
      ...data,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };
    await db.collection(collection).insertOne(doc);
    return doc;
  });
}

export async function updateDocument(
  collection: string,
  id: string,
  data: any
): Promise<any> {
  return withMongo(async (db) => {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };
    const result = await db.collection(collection).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );
    return result;
  });
}

export async function deleteDocument(
  collection: string,
  id: string
): Promise<any> {
  return withMongo(async (db) => {
    const result = await db.collection(collection).findOneAndDelete({
      _id: new ObjectId(id),
    });
    return result;
  });
}

export { ObjectId };
