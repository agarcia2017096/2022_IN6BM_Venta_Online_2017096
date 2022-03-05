const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var ProductosSchema = Schema({
    nombreProducto: String,
    marca:String,
    stock: Number,
    precio: Number,
    vendido:Number,
    imagen:String,
    idUsuario: {type:Schema.Types.ObjectId,ref:'Usuarios'},
    idCategoria: {type:Schema.Types.ObjectId,ref:'Categorias'},
});

module.exports = mongoose.model('Productos',ProductosSchema);