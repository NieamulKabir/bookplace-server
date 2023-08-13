require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

const cors = require("cors");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9sbaw.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const db = client.db("book-place");
    const bookCollection = db.collection("books");
    const userCollection = db.collection("users");

    //get allbooks
    app.get("/books", async (req, res) => {
      const books = bookCollection.find({});
      const allBooks = await books.toArray();
      res.send({
        status: true,
        data: allBooks,
      });
    });
    //get single book by ID
    app.get("/book/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookCollection.findOne(query);

      res.send({
        status: true,
        data: result,
      });
    });

    //post a single Book
    app.post("/addBook", async (req, res) => {
      const book = req.body;
      const result = await bookCollection.insertOne(book);
      res.send(result);
    });

    //update a single book
    app.patch("/book/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: req.body,
      };
      const result = await bookCollection.updateOne(query, updateDoc);
      res.send({
        status: true,
        data: result,
      });
    });
    //delete a single book
    app.delete("/book/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookCollection.deleteOne(query);
      res.send({
        status: true,
        data: result,
      });
    });

    //get all user
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find({});
      const result = await cursor.toArray();
      res.send({ status: true, data: result });
    });

    //user create
    app.post("/user", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send({
        status: true,
        data: result,
      });
    });

    //get a single user by Email
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await userCollection.findOne({ email: email });
      res.send({ status: true, data: result });
    });

    app.patch("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: req.body,
      };
      const result = await userCollection.updateOne(query, updateDoc);
      res.send({ status: true, data, result });
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
