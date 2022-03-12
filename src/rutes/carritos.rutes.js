//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const express = require('express');
const carritosController = require('../controllers/carritos.controller')
const md_autentificacion = require('../middlewares/autentication')

//RUTAS
var api = express.Router();

//LOGIN DE LA APLICACIÓN 
api.post('/registrarCarrito',md_autentificacion.Auth, carritosController.RegistrarCarrito);

//ELIMINAR PRODUCTOS CARRITO 
api.delete('/eliminarProductosCarritos/:idProducto',md_autentificacion.Auth, carritosController.EliminarProductoCarrito);

module.exports = api