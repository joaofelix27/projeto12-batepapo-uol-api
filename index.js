import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";

const app = express();
app.use(cors());

const mongoClient = new MongoClient("mongodb://localhost:27017");
let db;

mongoClient.connect().then(() => {
	db = mongoClient.db("banco_de_dados_uol");
});

app.post( '/participants' ,(req,res) => {
    let {name} = req.body
    if ( typeof name ==="string" && name) {
        db.collection("users").insertOne({
            name: name,
            LastStatus: Date.now()
        });
        res.status("201")
    } else {
        res.status("402")
    }

})


app.listen(5000);