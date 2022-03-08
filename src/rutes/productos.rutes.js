//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const express = require('express');
const productosController = require('../controllers/productos.controller')
const md_autentificacion = require('../middlewares/autentication')

//RUTAS
var api = express.Router();

//******************* CRUD CATEGORIAS - FUNCIONES ADMINISTRADOR ****************** */
//REGISTRAR CATEGORIAS
api.post('/registrarProductos',md_autentificacion.Auth, productosController.RegistrarProductos);

//OBTENER TODOS LOS PRODUCTOS
api.get('/obtenerProductos', md_autentificacion.Auth, productosController.ObtenerTodosProductos);

//OBTENER PRODUCTOS POR ID
api.get('/obtenerProductosId/:idProducto', md_autentificacion.Auth, productosController.ObtenerProductoId);
module.exports = api