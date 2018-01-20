const mongoose = require('mongoose');


exports.schemaCliente = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    telefono: {
        type: Number
    },
    paese: {
        type: String
    },
    note: {
        type: String
    }
});

exports.schemaProdotto = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    categoria:{
        type: String
    },
    materiale:{
        type: String
    },
    prezzo:{
        type: Number,
        required: true
    },
    dimensioni: String
});

exports.schemaOrdine = new mongoose.Schema({
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cliente'
    },
    prodotti: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'prodotto'
    }],
    dataOrdine: Date,
    spedizione: String,
    totaleOrdine: Number
});