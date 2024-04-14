import { MongoClient } from 'mongodb';

const url = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url);

async function main() {
    try {
        await client.connect();
        console.log('Connected successfully to MongoDB');

        const db = client.db("task_tracker");
        const insertResult = await db.collection("users").insertOne({
            "userName": "test user",
            "email": ""
        });

        console.log('Inserted document:', insertResult);
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await client.close();
    }
}

main().catch(console.error);


