const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var FacturasSchema = Schema({
    nit: String,
    fecha: Date,
    idUsuario: {type: Schema.Types.ObjectId, ref: 'Usuarios'},
    compras: [{productos:
        {idProducto: {type:Schema.Types.ObjectId,ref:'Productos'},
        nombreProducto: String,
        cantidad: Number,
        precio: Number,
        subTotal: Number}
    }],
    total: Number
    
});

module.exports = mongoose.model('Facturas',FacturasSchema);