//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const express = require('express');
const facturasController = require('../controllers/facturas.controller')
const md_autentificacion = require('../middlewares/autentication')

//RUTAS
var api = express.Router();

//REGISTAR FACTURAS 
api.post('/registarFacturas',md_autentificacion.Auth, facturasController.RegistarFactura);

module.exports = api