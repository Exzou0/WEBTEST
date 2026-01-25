const { MongoClient } = require('mongodb');

let itemsCollection;

async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI;
  const DB_NAME = process.env.MONGO_DB_NAME || 'assignment3';

  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not set');
  }

  const client = new MongoClient(MONGO_URI);
  await client.connect();

  const db = client.db(DB_NAME);
  itemsCollection = db.collection('items');

  console.log('MongoDB connected');
}

function getItemsCollection() {
  if (!itemsCollection) throw new Error('MongoDB not initialized');
  return itemsCollection;
}

module.exports = { connectDB, getItemsCollection };
