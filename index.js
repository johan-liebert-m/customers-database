const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb+srv://FouadNouioua:foufoufor9khawa@cluster0-umptz.mongodb.net/test?retryWrites=true&w=majority";

//set ejs as view engine
app.set("view engine", "ejs");

// configure body-parser for express
const bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

// login page
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/public/login.html");
});

// home page (databse controll)
app.post("/login", function(req, res) {
    if(req.body.admin == "admindb" && req.body.password == "passworddb") {
        res.sendFile(__dirname + "/public/insert.html");
    }
    else {
        res.sendFile(__dirname + "/public/wrong-login.html");
    }
});

// insert customer into the database
app.post("/insert", function(req, res) {
   MongoClient.connect(url, function(err, db) {
       if (err) throw err;
       let dbo = db.db("customers-db");
       function capitalizeFirstLetter(string) {
           return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
       }
       let customer = {
           firstName: capitalizeFirstLetter(req.body.firstName),
           lastName: capitalizeFirstLetter(req.body.lastName),
           age: req.body.age,
           phoneNumber: req.body.phoneNumber
       }
       dbo.collection("customers-collection").insertOne(customer, function(err, res) {
           if (err) throw err;
           console.log("customer inserted succesfully");
           db.close();
       });
       res.sendFile(__dirname + "/public/insert.html");
   });
});

// display customers
app.get("/customersdb", function(req, res) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("customers-db");
        dbo.collection("customers-collection").find({}).sort({ firstName: 1 }).toArray(function(err, result) {
            if (err) throw err;
            res.render(__dirname + "/public/display", {ejsResult: result});
            console.log("database displayed succesfully");
            db.close();
        });
    });
});

// update a customer
app.post("/update", function(req, res) {
   MongoClient.connect(url, function(err, db) {
       if (err) throw err;
       let dbo = db.db("customers-db");
       function capitalizeFirstLetter(string) {
           return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
       }
       dbo.collection("customers-collection").updateOne({ phoneNumber: req.body.phoneUpdate }, { $set: { firstName: capitalizeFirstLetter(req.body.newFirstName), lastName: capitalizeFirstLetter(req.body.newLastName), age: req.body.newAge, phoneNumber: req.body.newPhoneNumber } }, function(err, res) {
           if (err) throw err;
           console.log("customer updated succesfully");
           db.close();
       });
   });
    res.sendFile(__dirname + "/public/insert.html");
});

// delete a customer
app.post("/delete", function(req, res) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("customers-db");
        dbo.collection("customers-collection").deleteOne({ phoneNumber: req.body.phoneDelete }, function(err, obj) {
            if (err) throw err;
            console.log("customer deleted succesfully");
            db.close();
        });
        res.sendFile(__dirname + "/public/insert.html");
    });
});

// clear database
app.post("/clear", function(req, res) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("customers-db");
        dbo.collection("customers-collection").drop(function(err, cleared) {
            if (err) throw err;
            if (cleared) console.log("database cleared succesfully");
            db.close();
        });
        res.sendFile(__dirname + "/public/insert.html");
    });
});

// download database
app.get("/download", function(req, res) {
   MongoClient.connect(url, function(err, db) {
       if (err) throw err;
       let dbo = db.db("customers-db");
       dbo.collection("customers-collection").find({}).sort({ firstName: 1 }).toArray(function(err, result) {
           if (err) throw err;
           res.render(__dirname + "/public/download", { database: result });
           console.log("database downloaded succesfully");
           db.close();
       });
   });
});


// server listening
app.listen(port);
console.log("server running on " + port);

// errors handling
const errorsHandling = require("./errorsHandling");
app.use(errorsHandling.onError404);
app.use(errorsHandling.onError500);
