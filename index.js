const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mhdj2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('CmartDB');
        const carCollection = database.collection('cars');
        const orderCollection = database.collection('orders');
        const userCollection = database.collection('users');
        const reviewCollection = database.collection('reviews');

        // ALL CARS GET API
        app.get('/cars', async (req, res) => {
            const cars = await carCollection.find({}).toArray();
            res.json(cars);
        })

        // Single Car GET API
        app.get('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await carCollection.findOne(query);
            res.json(result);
        })

        // CAR POST API
        app.post('/cars', async (req, res) => {
            const car = req.body;
            const result = await carCollection.insertOne(car);
            res.json(result);
        })

        // CAR DELETE API
        app.delete('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await carCollection.deleteOne(query);
            res.json(result);
        })

        // Order Post API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })

        // Order Get API
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            let result;
            if (email) {
                result = await orderCollection.find({ email: email }).toArray();
            }
            else {
                result = await orderCollection.find({}).toArray();
            }
            res.json(result);
        })

        // Change Order Status
        app.put('/orders', async (req, res) => {
            const { id, status } = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = { $set: { status: status } }
            const result = await orderCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // Order Delete API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        })

        // User POST API
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
        })

        // User Put API
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = { $set: user }
            const options = { upsert: true };
            const result = await userCollection.updateOne(filter, updateDoc, options)
            res.json(result);
        })

        // Check User role Api
        app.get('/users', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin;
            if (user?.role === "admin") {
                isAdmin = true;
            }
            else {
                isAdmin = false;
            }
            res.json({ admin: isAdmin });
        })

        // Make Admin API
        app.put('/users/admin', async (req, res) => {
            const email = req.body.email;
            const filter = { email: email };
            const updateDoc = { $set: { role: 'admin' } }
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result)
        })

        // Review Post API
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
        })

        // Review Get API
        app.get('/reviews', async (req, res) => {
            const result = await reviewCollection.find({}).toArray();
            res.json(result);
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('cmart server is running')
})

app.listen(port, () => {
    console.log('cmart server is running on port', port);
})