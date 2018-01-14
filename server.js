console.log("May Node be with you");

const express = require('express');
const bodyParser= require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');


// Connection URL
const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'dbordini';

const app = express();

var db;

app.use(bodyParser.urlencoded({extended: true}))

// Use connect method to connect to the server
MongoClient.connect(url, function (err, client) {
    if (err) throw err;
    console.log("Connected successfully to MongoDB");

    db = client.db(dbName);
    
    // when conncted to mongo, start listen
    app.listen(3000, function () {
        console.log("listening on 3000");
    });

    
});



app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.all('/quotes', (req, res, next) => {
    console.log('intercettato richiesta ');
    next();
});

app.post('/quotes', (req, res) => {
    console.log(req.body);
    db.collection('quotes').save(req.body, (err, result) => {
        if (err) return console.log(err)

        console.log('saved to database')
        res.json(result)
    })
});

app.get('/quotes', (req, res) => {
    db.collection('quotes').find().toArray(function (err, results) {
        console.log(results)
        res.json(results);
    })

});
