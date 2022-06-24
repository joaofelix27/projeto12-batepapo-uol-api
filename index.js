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
const messageSchema = joi.object({
  to: joi.string().alphanum().required(),
  text: joi.string().alphanum().required(),
  type: joi.string().valid("message", "private_message").required(),
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
    const alreadyExists = await db
      .collection("users")
      .find({ name: name })
      .toArray();
    console.log(alreadyExists); // if the current name already exists, this variable.lenght is !0
    if (alreadyExists.length === 0) {
      let now = dayjs();
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

app.get("/participants", async (req, res) => {
  // searching for users
  const users = await db.collection("users").find().toArray();
  res.send(users);
});
app.get("/messages", async (req, res) => {
  const user = req.headers.user;
  const limit = req.query.limit;
  const messages = await db.collection("messages").find().toArray();
  // searching for messages
  const filteredMessages = messages.filter(
    (message) =>
      message.from === user ||
      message.to === user ||
      message.type === "message" ||
      message.type === "status"
  );
  if (limit) {
    res.send(filteredMessages.slice(-limit));
  } else {
    res.send(filteredMessages); // messages array
  }
});
app.post("/messages", async (req, res) => {
  const user = req.headers.user;
  const { to, text, type } = req.body;
  const validation = messageSchema.validate(req.body, { abortEarly: true });
  const activeUser = await db
    .collection("users")
    .find({ name: user })
    .toArray();
  if (validation.error || activeUser.length === 0) {
    res.sendStatus(422);
    return;
  }
  try {
    let now = dayjs();
    await db.collection("messages").insertOne({
      from: user,
      to: to,
      text: text,
      type: type,
      time: now.format("HH:mm:ss"),
    });
    res.sendStatus(201);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});
app.post("/status", async (req, res) => {
  const user = req.headers.user;
  try {
    const usersColection = db.collection("users");
    const activeUser = await usersColection.find({ name: user }).toArray();
    if (!activeUser) {
      res.sendStatus(404);
      return;
    }
    await usersColection.updateOne(
      { name: user },
      {
        $set: {
          LastStatus: Date.now()
        }
      }
    );
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
});
app.listen(5000);
