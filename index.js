const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
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

    //Get Api to get all the products
    app.get("/products", async (req, res) => {
      const size = parseInt(req.query.size);
      const cursor = productCollections.find({});
      let products;
      if (size) {
        products = await cursor.limit(size).toArray();
      }
      else{
          products = await cursor.toArray();
      }
      res.send(products);
    });

    //Api to get user reviews
    app.get('/reviews', async(req,res) => {
        const cursor = reviewCollections.find({});
        const reviews = await cursor.toArray();
        res.send(reviews);
    })

    //API to load a single product
    app.get("/products/:id", async(req,res) => {
      const id = req.params.id;
      console.log(id);
      const query = {key : id};
      const product = await productCollections.findOne(query);
      console.log(product);
      res.send(product);
    })

    //API to store orders
    app.post('/orders', async(req,res) => {
      const order = req.body;
      const result = await orderCollections.insertOne(order);

      res.json(result);
    })
  } finally {
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
