console.log("May Node be with you");

const express = require('express');
const bodyParser= require('body-parser');
const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const querystring = require('querystring');
const mongoose = require('mongoose');
const schemaDefinition = require('./schemaDefinition');

var Schema = mongoose.Schema;




// Connection URL
const url = 'mongodb://localhost:27017/ordini_vale';
// Database Name
const dbName = 'ordini_vale';

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// uso mongoose per facilitarmi la vita con le referenze
mongoose.connect(url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connected successfully to MongoDB");
    // when conncted to mongo, start listen
    app.listen(3000, function () {
        console.log("listening on 3000");
    });
});

var Cliente = db.model('cliente', schemaDefinition.schemaCliente);
var Prodotto = db.model('prodotto', schemaDefinition.schemaProdotto);


// Use connect method to connect to the server
/* MongoClient.connect(url, function (err, client) {
    if (err) throw err;
    console.log("Connected successfully to MongoDB");

    db = client.db(dbName);
    
    // when conncted to mongo, start listen
    app.listen(3000, function () {
        console.log("listening on 3000");
    });

    
}); */



app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// ricerca dei prodotti
app.get('/prodotti', (req, res) => {

    // /prodotti?nome=piccola
    console.log("Ricerca prodotti");
    // controllo se son stati passati dei parametri per filtrare la ricerca
    var filter = undefined;
    if (req.query && req.query.nome) {
        console.log("Nome passato come paramtro di ricerca: " + req.query.nome);
        filter = { "nome": new RegExp(req.query.nome, 'i') };
    }

    Prodotto.find(filter, (err, prodotti) => {
        if(err){
            console.error(err);
            return res.send(500, err);
        }
        res.send(200, prodotti);
    });
});
// aggiunge nuovi prodotti
app.post('/prodotti', (req, res) => {
    console.log(req.body);
    var nuovoProdotto = new Prodotto(req.body);
    nuovoProdotto.save((err, prodotto) => {
        if(err){
            console.error(err);
            return res.send(500, err);
        }
        res.send(200, prodotto);
    });

});

// elimina un prodotto in base all'id
app.delete('/prodotti/:id', (req, res) => {
    console.log("Richiesta di eleiminazione dell'id " + req.params.id);
    Prodotto.deleteOne({ _id: new mongodb.ObjectID(req.params.id) }, (err) => {
        if (err) {
            console.log("failed");
            res.send(404, 'prodotto non trovato');
        }
        res.send(200, "Elemento eliminato");
    });
});

// ottiene la lista di clienti
app.get('/clienti', (req, res) => {
    // controllo se son stati passati dei parametri per filtrare la ricerca
    var filter = undefined;
    if (req.query && req.query.nome) {
        console.log("Nome passato come paramtro di ricerca: " + req.query.nome);
        filter = { "nome": new RegExp(req.query.nome, 'i') };
    }
    Cliente.find(filter, (err, clienti) => {
        if (err) {
            console.error(err);
            return res.send(500, err);
        }
        res.send(200, clienti);
    })
});

// aggiunge un cliente
app.post('/clienti', (req,res) => {
    console.log("Inserimento di un cliente");
    var nuovoCliente = new Cliente(req.body);
    nuovoCliente.save((err, cliente) => {
        if(err){
            console.error(err);
            return res.send(500, err);
        }
        res.send(200, cliente);
    });

});

// elimina un cliente in base all'id
app.delete('/clienti/:id', (req, res) => {
    console.log("Richiesta di eliminazione del cliente con id " + req.params.id);
    Cliente.deleteOne({ _id: new mongodb.ObjectID(req.params.id) }, (err) => {
        if (err) {
            console.error("Errore durante l'eliminazione del cliente", err);
            res.send(404, 'cliente non trovato');
        }
        res.send(200, 'Cliente eliminato con successo');
    });
});

// crea un ordine associando dei prodotti a dei clienti
app.get('/ordini', (req, res) => {

    db.collection('ordini').aggregate([
        {
            $lookup:
                {
                    from: 'clienti',
                    localField: 'cliente',
                    foreignField: '_id',
                    as: 'cliente'
                }
        }
    ], function (err, res) {
        if (err) throw err;
        console.log(JSON.stringify(res));
        res.send(200);
    });

});

app.post('/ordini', (req,res) => {
    console.log(req.body);

    db.collection('ordini').save(req.body, (err, result) => {
        if (err){
            console.error(err);
            return res.send(500, "Non è possibile salvare l'ordine");
        }
        console.log("Ordine salvato a db");
        res.send(200, result);
    });
});
