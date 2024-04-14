import { MongoClient } from "mongodb";

const DB = "task_tracker";

export async function setupMongo() {
    const client = new MongoClient(process.env.MONGO_URL || "mongodb://127.0.0.1:27017");
    await client.connect();
    const db = client.db(DB);

    const tasksCollection = db.collection("tasks");
    const usersCollection = db.collection("users");

    await usersCollection.createIndex({ "_id": 1 }, { unique: true });
    await tasksCollection.createIndex({ "_id": 1, "date": 1, "title": 1 }, { unique: true });

    return {
        tasksCollection,
        usersCollection
    };
}