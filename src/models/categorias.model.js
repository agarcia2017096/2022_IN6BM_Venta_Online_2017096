const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var ProductosSchema = Schema({
    nombreCategoria: String,
    idUsuario: {type:Schema.Types.ObjectId,ref:'Usuarios'}
});

module.exports = mongoose.model('Productos',ProductosSchema);