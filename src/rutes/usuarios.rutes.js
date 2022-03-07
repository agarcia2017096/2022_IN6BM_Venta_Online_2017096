//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const express = require('express');
const usuariosController = require('../controllers/usuarios.controller')
const md_autentificacion = require('../middlewares/autentication')

//RUTAS
var api = express.Router();

//LOGIN DE LA APLICACIÓN 
api.post('/login', usuariosController.Login);

//REGISTRAR USUARIO - CLIENTE
api.post('/registrarUsuarios', usuariosController.RegistrarClientes);

//EDITAR USUARIO CON VERIFICACIONES
api.put('/editarUsuarios/:idUsuario',md_autentificacion.Auth, usuariosController.EditarPerfilUsuario)

//ELIMINAR USUARIO - CLIENTE
api.delete('/eliminarUsuarios/:idUsuario',md_autentificacion.Auth,usuariosController.EliminarUsuarios)


module.exports = api