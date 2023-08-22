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
    const wishlistCollection = db.collection("wishlists");

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
      const updatedDoc = {
        $set: req.body,
      };
      // console.log(updatedDoc);
      const result = await userCollection.updateOne(query, updatedDoc);
      res.send({ status: true, data: result });
    });

    //wishlist
    app.post("/addWishlist", async (req, res) => {
      const { userId, bookId } = req.body;
      const payload = { userId, bookId: [bookId] };

      let result;
      const exist = await wishlistCollection.findOne({ userId });
      if (exist) {
        result = await wishlistCollection.findOneAndUpdate(
          { userId },
          { $push: { bookId: bookId } }
        );
      } else result = await wishlistCollection.insertOne(payload);

      res.send({ status: true, data: result });
    });
    app.delete("/wishlist/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await wishlistCollection.findOne(query);
      res.send({ status: true, data: result });
    });
    app.get("/wishlist/:id", async (req, res) => {
      const userId = req.params.id;
      const result = await wishlistCollection.findOne({ userId });

       res.send({ status: true, data: result });
    });

    // app.post("/addWishList", async (req, res) => {
    //     const { userId, bookId } = req.body;

    //     const userQuery = await userCollection.findOne({
    //       _id: new ObjectId(userId),
    //     });
    //     const bookQuery = await bookCollection.findOne({
    //       _id: new ObjectId(bookId),
    //     });
    //     if (!userQuery || !bookQuery) {
    //       res.status(404).json({ error: "Invalid request" });
    //     }
    //     const payload = {
    //       user: userQuery?._id,
    //       books: bookQuery?._id,
    //     };

    //     const newWishlist = await wishlistCollection.insertOne([payload]);
    //     newWishlistAllData = newWishlist[0];

    //     if (!newWishlist) {
    //       res.status(404).json({ error: "Invalid request" });
    //     }
    //     if (newWishlistAllData) {
    //       newWishlistAllData = await wishlistCollection.findOne({
    //         _id: newWishlistAllData._id,
    //       });
    //     }
    //     res.status(200).json({
    //       success: true,
    //       message: "successfully add to wishlist!",
    //       data: result,
    //     });
    //   });
    // app.post("/addWishList", async (req, res) => {
    //   const { userId, bookId } = req.body;
    //   // const payload = { userId, bookId };

    //   const user = await wishlistCollection.findOne({ userId });
    //   const alreadyAdded = user.find((id) => id.toString() === bookId);

    //   // const exist = await wishlistCollection.findOne({ userId });
    //   if (alreadyAdded) {
    //     const result = await wishlistCollection.findOneAndUpdate(
    //       { userId },
    //       { $pull: { books: bookId } },
    //       { new: true }
    //     );
    //     res.json(result);
    //   } else {
    //     const result = await wishlistCollection.findOneAndUpdate(
    //       { userId },
    //       { $push: { books: bookId } },
    //       { new: true }
    //     );
    //     res.json(result);
    //   }
    // });
    // app.get("/wishlist/:id", async (req, res) => {
    //   const userId = req.params.id;
    //   const result = await wishlistCollection.findOne({ userId });

    //   if (result) {
    //     return res.json(result);
    //   }

    //   res.status(404).json({ error: "Book not found" });
    // });
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
