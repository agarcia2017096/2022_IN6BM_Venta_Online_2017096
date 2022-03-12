//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var CarritosSchema = Schema({
    idUsuario: {type: Schema.Types.ObjectId, ref: 'Usuarios'},
    compras: [{
            productos:{
                idProducto: {type:Schema.Types.ObjectId,ref:'Productos'},
                nombreProducto: String,
                cantidad: Number,
                precio: Number,
                subTotal: Number
            }
        }],
    total: Number
});

module.exports = mongoose.model('Carritos',CarritosSchema);