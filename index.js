const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

//MongoDb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.voagd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("drone-website");
    const productCollections = database.collection("products");
    const reviewCollections = database.collection("reviews");
    const orderCollections = database.collection("orders");
    const userCollections = database.collection("users");

    //Get Api to get all the products
    app.get("/products", async (req, res) => {
      const size = parseInt(req.query.size);
      const cursor = productCollections.find({});
      let products;
      if (size) {
        products = await cursor.limit(size).toArray();
      } else {
        products = await cursor.toArray();
      }
      res.send(products);
    });

    //Post API to post new Product
    app.post("/addNewProduct", async (req, res) => {
      const product = req.body;
      console.log(product);
      const result = await productCollections.insertOne(product);
      res.json(result);
    });

    //Api to get user reviews
    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollections.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    //Api to store user reviews
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollections.insertOne(review);

      res.json(result);
    });

    //API to load a single product
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id : ObjectId(id) };
      const product = await productCollections.findOne(query);
      res.send(product);
    });

    //API to delete a Product
    app.delete("/products/:id", async (req, res) => {
      const query = { _id: ObjectId(req.params.id) };

      const result = await productCollections.deleteOne(query);
      res.json(result);
    });

    //API to store orders
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollections.insertOne(order);

      res.json(result);
    });

    //API to get all orders
    app.get("/orders", async (req, res) => {
      const cursor = orderCollections.find({});
      const orders = await cursor.toArray();

      res.send(orders);
    });

    //API to delete an order
    app.delete("/orders/:id", async (req, res) => {
      const query = { _id: ObjectId(req.params.id) };

      const result = await orderCollections.deleteOne(query);
      res.json(result);
    });

    //Update Api
    app.put("/orders/:id", async (req, res) => {
      const filter = { _id: ObjectId(req.params.id) };
      const options = { upsert: true };

      const updateDoc = {
        $set: {
          status: "Shipped",
        },
      };

      const result = await orderCollections.updateOne(
        filter,
        updateDoc,
        options
      );

      res.json(result);
    });

    //API to save user on Mongodb
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollections.insertOne(user);
      res.json(result);
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollections.updateOne(query, updateDoc, options);
      res.json(result);
    });

    //API to get all the orders of a user
    app.post("/orders/user", async (req, res) => {
      const userEmail = req.body.email;
      const query = { email: userEmail };
      const orders = await orderCollections.find(query).toArray();
      res.json(orders);
    });

    //API to make an Admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const updateDoc = {
        $set: { role: "admin" },
      };
      const result = await userCollections.updateOne(query, updateDoc);
      res.json(result);
    });

    //API to get list of an Admin
    app.get("/users/admin", async (req, res) => {
      const query = { role: "admin" };
      const cursor = userCollections.find(query);
      const admins = await cursor.toArray();
      res.send(admins);
    });

    //API to know, if a user is Admin or not
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollections.findOne(query);

      let isAdmin = { admin: false };
      if (user?.role === "admin") {
        isAdmin.admin = true;
      }
      res.json(isAdmin);
    });
  } finally {
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("SquadDrone server is running");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
