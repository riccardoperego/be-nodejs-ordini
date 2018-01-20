console.log("May Node be with you");

const express = require('express');
const bodyParser= require('body-parser');
const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const querystring = require('querystring');


// Connection URL
const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'ordini_vale';

const app = express();

var db;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

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

app.get('/prodotti', (req, res) => {

    // /prodotti?nome=piccola
    console.log("Ricerca prodotti");
    // controllo se son stati passati dei parametri per filtrare la ricerca
    var filter = undefined;
    if (req.query && req.query.nome) {
        console.log("Nome passato come paramtro di ricerca: " + req.query.nome);
        filter = { "nome": new RegExp(req.query.nome, 'i') };
    }
    // cerco i prodotti
    db.collection('prodotti').find(filter).toArray(function (err, results) {
        console.log(results)
        res.json(results);
    });
});

app.post('/prodotti', (req, res) => {
    console.log(req.body);

    // aggiungo il nuovo prodotto
    db.collection('prodotti').save(req.body, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        console.log(result);
        res.json(result)
    });
});

// elimina un prodotto in base all'id
app.delete('/prodotti/:id', (req, res) => {
    console.log("Richiesta di eleiminazione dell'id " + req.params.id);
    db.collection('prodotti').deleteOne({ _id: new mongodb.ObjectID(req.params.id) }, function (err, results) {
        if (err) {
            console.log("failed");
            res.send(404, 'prodotto non trovato');
        }
        res.send(200, 'Prodotto eliminato con successo');
    })
});

