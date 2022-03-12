//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const express = require('express');
const productosController = require('../controllers/productos.controller')
const md_autentificacion = require('../middlewares/autentication')

//RUTAS
var api = express.Router();

//******************* CRUD PRODUCTOS - FUNCIONES ADMINISTRADOR ****************** */
//REGISTRAR CATEGORIAS
api.post('/registrarProductos',md_autentificacion.Auth, productosController.RegistrarProductos);

//OBTENER TODOS LOS PRODUCTOS
api.get('/obtenerProductos', md_autentificacion.Auth, productosController.ObtenerTodosProductos);

//OBTENER PRODUCTOS POR ID
api.get('/obtenerProductosId/:idProducto', md_autentificacion.Auth, productosController.ObtenerProductoId);

//EDITAR PRODUCTOS 
api.put('/editarProductos/:idProducto', md_autentificacion.Auth, productosController.EditarProductos);

//******************* CRUD PRODUCTOS - FUNCIONES CLIENTE ****************** */
//BUSCAR PRODUCTOS POR NOMBRE
api.get('/productosNombre/:nombreProducto',md_autentificacion.Auth,productosController.ObtenerNombreProductos)

//BUSCAR CATEGORIAS 
api.get('/obtenerCategorias',md_autentificacion.Auth,productosController.ObtenerCategorias)

//BUSCAR CATEGORIAS POR NOMBRE
api.get('/categoriasNombre/:nombreCategoria',md_autentificacion.Auth,productosController.ObtenerNombreCategorias)

//BUSCAR CATALOGO DE PRODUCTOS CON MAYOR CANTIDAD DE VENTAS
api.get('/catalogoProductos',md_autentificacion.Auth,productosController.CatalogoProductosMasVendidos)

module.exports = api
