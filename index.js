const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zptcbye.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const toyCollection = client.db("toyZone").collection("toys");

    app.post("/post-toy", async (req, res) => {
      const toy = req.body;
      toy.createdAt = new Date();
      const result = await toyCollection.insertOne(toy);
      res.send(result);
    });

    app.get("/all-toys", async (req, res) => {
      const cursor = toyCollection.find().sort({ createdAt: -1 }).limit(20);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/my-toys/:email", async (req, res) => {
      const toys = await toyCollection
        .find({
          sellerEmail: req.params.email,
        })
        .toArray();
      res.send(toys);
    });

    app.get("/allToysByCategory/:category", async (req, res) => {
      const category = req.params.category;
      if (
        category == "Car" ||
        category == "Truck" ||
        category == "Racing Car"
      ) {
        const toys = await toyCollection
          .find({
            subcategory: category,
          })
          .limit(4)
          .toArray();

        return res.send(toys);
      }
      const toys = await toyCollection.find({}).limit(4).toArray();
      res.send(toys);
    });

    app.get("/getToysBySearch/:text", async (req, res) => {
      const text = req.params.text;
      const result = await toyCollection
        .find({
          toyName: { $regex: text, $options: "i" },
        })
        .toArray();
      res.send(result);
    });

    app.get("/view-toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    app.put("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const UpdatedToy = req.body;

      const coffee = {
        $set: {
          toyName: UpdatedToy.toyName,
          sellerName: UpdatedToy.sellerName,
          sellerEmail: UpdatedToy.sellerEmail,
          subcategory: UpdatedToy.subcategory,
          price: UpdatedToy.price,
          rating: UpdatedToy.rating,
          quantity: UpdatedToy.quantity,
          photoUrl: UpdatedToy.photoUrl,
          description: UpdatedToy.description,
        },
      };

      const result = await toyCollection.updateOne(filter, coffee, options);
      res.send(result);
    });

    app.delete("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Toy Zone server is running...");
});

app.listen(port, () => {
  console.log(`Toy Zone server is running on port ${port}`);
});
