const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var FacturasSchema = Schema({
    nit: String,
    idUsuario: {type:Schema.Types.ObjectId,ref:'Usuarios'}
});

module.exports = mongoose.model('Facturas',FacturasSchema);