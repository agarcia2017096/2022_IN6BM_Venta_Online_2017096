//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const express = require('express');
const categoriasController = require('../controllers/categorias.controller')
const md_autentificacion = require('../middlewares/autentication')


//RUTAS
var api = express.Router();

 //******************* CRUD CATEGORIAS - FUNCIONES ADMINISTRADOR ****************** */
//REGISTRAR CATEGORIAS
api.post('/registrarCategorias',md_autentificacion.Auth, categoriasController.RegistrarCategorias);

//EDITAR CATEGORIAS
api.put('/editarCategorias/:idCategoria',md_autentificacion.Auth, categoriasController.EditarCategorias);

//OBTENER LAS CATEGORIAS DEL ADMINISTRADOR
api.get('/obtenerCategoriasAdministrador', md_autentificacion.Auth, categoriasController.ObtenerCategoriasAdministrador);

//ELIMINAR CATEGORIAS
api.delete('/eliminarCategorias/:idCategoria', md_autentificacion.Auth, categoriasController.EliminarCategorias);


module.exports = api
