import { MongoClient } from "mongodb";

const SEED_DB_URL = process.env.DATABASE_URL?.replace("?replicaSet=rs0", "") || "mongodb://mongo:27017/millionare-ecom-lifeplan";

async function fixOrders() {
  const mongoClient = new MongoClient(SEED_DB_URL);
  await mongoClient.connect();
  
  try {
    const db = mongoClient.db("millionare-ecom-lifeplan");
    
    // Find orders without createDate
    const ordersWithoutCreateDate = await db.collection("Order").find({ createDate: null }).toArray();
    console.log(`Found ${ordersWithoutCreateDate.length} orders without createDate`);
    
    // Update them
    if (ordersWithoutCreateDate.length > 0) {
      for (const order of ordersWithoutCreateDate) {
        await db.collection("Order").updateOne(
          { _id: order._id },
          { $set: { createDate: order.createdAt || new Date() } }
        );
      }
      console.log(`✓ Fixed ${ordersWithoutCreateDate.length} orders`);
    }
    
    // Also check for orders without createdAt field
    const allOrders = await db.collection("Order").find({}).toArray();
    console.log(`Total orders: ${allOrders.length}`);
    
    for (const order of allOrders) {
      if (!order.createDate) {
        await db.collection("Order").updateOne(
          { _id: order._id },
          { $set: { createDate: order.createdAt || new Date() } }
        );
        console.log(`Fixed order ${order._id}`);
      }
    }
    
  } finally {
    await mongoClient.close();
  }
}

fixOrders().catch(console.error);
