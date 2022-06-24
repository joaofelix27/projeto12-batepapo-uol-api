import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import joi from "joi";
import dayjs from "dayjs";

const app = express();
app.use(express.json());
app.use(cors());


const userSchema = joi.object({
  name: joi.string().alphanum().required(),
});

const mongoClient = new MongoClient("mongodb://localhost:27017");
let db;
mongoClient.connect().then(() => {
  db = mongoClient.db("banco_de_dados_uol");
});
app.post("/participants", async (req, res) => {
  let { name } = req.body;
  const validation = userSchema.validate(req.body, { abortEarly: true });

  if (validation.error) {
    res.sendStatus(422);
    return;
  } 
  try {
    const alreadyExists = await db.collection("users").find({ name: name }) .toArray();
    console.log(alreadyExists); // if the current name already exists, this variable.lenght is !0
    if (alreadyExists.length === 0) {
      let now=dayjs()
     await db.collection("users").insertOne({
       name: name,
       LastStatus: Date.now(),
     });
    await db.collection("messages").insertOne({
       from: name,
       to: "Todos",
       text: "entra na sala...",
       type: "status",
       time: now.format("HH:mm:ss"),
     });
     res.sendStatus(201);
   } else {
     res.sendStatus(409);
   }
   } catch (error) {
    console.error(error);
    res.sendStatus(500);
   }
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
