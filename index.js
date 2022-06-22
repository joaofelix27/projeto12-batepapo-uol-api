import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";

const app = express();
app.use(express.json());
app.use(cors());

const mongoClient = new MongoClient("mongodb://localhost:27017");
let db;

mongoClient.connect().then(() => {
  db = mongoClient.db("banco_de_dados_uol");
});

app.post("/participants", (req, res) => {
  let { name } = req.body;
  db.collection("users")
    .find({
      name: name,
    })
    .toArray()
    .then((alreadyExists) => {
      console.log(alreadyExists); // users array
      if (alreadyExists.length === 0) {
        if (typeof name === "string" && name) {
          db.collection("users").insertOne({
            name: name,
            LastStatus: Date.now(),
          });
          res.sendStatus(201);
          db.collection("messages").insertOne({
            from: name,
            to: "Todos",
            text: "entra na sala...",
            type: "status",
            time: "00:00:06",
          });
        } else {
          res.sendStatus(402);
        }
      } else {
        res.sendStatus(409);
      }
    });
});

app.get("/participants", (req, res) => {
  // searching for users
  db.collection("users")
    .find()
    .toArray()
    .then((users) => {
      res.send(users); // users array
    });
});
app.get("/messages", (req, res) => {
  const limit = req.query.limit;
  // searching for messages
  db.collection("messages")
    .find()
    .toArray()
    .then((messages) => {
      res.send(messages); // messages array
    });
});
app.listen(5000);
