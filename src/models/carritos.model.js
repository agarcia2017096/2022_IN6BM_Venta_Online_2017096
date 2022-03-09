const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var CarritosSchema = Schema({

    compras: [{productos:
        {idProducto: {type: mongoose.Schema.ObjectId, ref: "Product"},
        nombreProducto: String,
        cantidad: Number,
        precio: Number,
        subTotal: Number}
    }],
    total: Number
});

module.exports = mongoose.model('Carritos',CarritosSchema);