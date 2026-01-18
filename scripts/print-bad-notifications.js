// Script to print count and IDs of notifications with null or missing title
// const { MongoClient } = require('mongodb'); // MongoDB code removed: now using PostgreSQL with Prisma

async function main() {
  // const uri = process.env.DATABASE_URL || 'YOUR_MONGODB_URI_HERE';
  // const client = new MongoClient(uri); // MongoDB client removed: now using PostgreSQL with Prisma
  try {
    await client.connect();
    const db = client.db('windowshopdb');
    const notifications = await db.collection('Notification').find({ $or: [ { title: null }, { title: { $exists: false } } ] }).toArray();
    if (notifications.length === 0) {
      console.log('No notifications with null or missing title.');
    } else {
      console.log(`Found ${notifications.length} notifications with null or missing title.`);
      notifications.forEach(n => console.log({ id: n._id, title: n.title, body: n.body }));
    }
  } finally {
    await client.close();
  }
}

main().catch(console.error);
