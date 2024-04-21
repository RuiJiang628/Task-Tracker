import { MongoClient } from 'mongodb';

const url = process.env.MONGO_URL || "mongodb://localhost:27017";

const client = new MongoClient(url);

async function main() {
    try {
        await client.connect();
        console.log('Connected successfully to MongoDB');

        const db = client.db("task_tracker");

        db.collection("users").createIndex(
            { netID: 1 }, 
            { unique: true }
          )

        //   const insertResult = await db.collection("users").insertMany([
        //     {
        //         "netID": "test123",
        //         "userName": "Test User 1",
        //         "email": "test123@example.com"
        //     },
        //     {
        //         "netID": "test124",
        //         "userName": "Test User 2",
        //         "email": "test124@example.com"
        //     },
        //     {
        //         "netID": "test125",
        //         "userName": "Test User 3",
        //         "email": "test125@example.com"
        //     },
        //     {
        //         "netID": "test126",
        //         "userName": "Test User 4",
        //         "email": "test126@example.com"
        //     }
        // ])
        // console.log('Inserted document:', insertResult);
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await client.close();
    }
}

main().catch(console.error);


