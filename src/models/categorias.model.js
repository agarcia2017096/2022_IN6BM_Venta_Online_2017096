const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var ProductosSchema = Schema({
    nombreCategoria: String,
    descripcionCategoria:String,
    idUsuario: {type:Schema.Types.ObjectId,ref:'Usuarios'}
});

module.exports = mongoose.model('Categorias',ProductosSchema);