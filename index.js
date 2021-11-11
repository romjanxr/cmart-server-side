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

console.log(uri)

async function run() {
    try {
        await client.connect();
        const database = client.db('CmartDB');
        const carCollection = database.collection('cars');

        // ALL CARS GET API
        app.get('/cars', async (req, res) => {
            const cars = await carCollection.find({}).toArray();
            res.json(cars);
        })

        // CAR POST API
        app.post('/cars', async (req, res) => {
            const car = req.body;
            console.log(car)
            const result = await carCollection.insertOne(car);
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