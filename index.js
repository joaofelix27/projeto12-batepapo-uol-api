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
      console.log(alreadyExists); // array de usuários
      if (alreadyExists.length===0) {
        if (typeof name === "string" && name) {
          db.collection("users").insertOne({
            name: name,
            LastStatus: Date.now(),
          });
          res.sendStatus(201);
        } else {
          res.sendStatus(402);
        }
      } else {
        res.sendStatus(409);
      }
    });
});

app.get("/participants", (req, res) => {
  // buscando usuários
  db.collection("users")
    .find()
    .toArray()
    .then((users) => {
      res.send(users); // array de usuários
    });
});

app.listen(5000);
