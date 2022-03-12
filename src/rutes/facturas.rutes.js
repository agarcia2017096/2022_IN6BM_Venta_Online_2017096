//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const express = require('express');
const facturasController = require('../controllers/facturas.controller')
const md_autentificacion = require('../middlewares/autentication')


//RUTAS
var api = express.Router();

//REGISTAR FACTURAS 
api.post('/registarFacturas',md_autentificacion.Auth, facturasController.RegistarFactura);

//MOSTRAR FACTURAS 
api.get('/mostrarFacturas',md_autentificacion.Auth, facturasController.MostrarFacturas);

//******************************* GESTION ADMINITRADOR ********************************//
//MOSTRAR FACTURAS  QUE TIENENE SUS USUARIO
api.get('/mostrarFacturasUsuarios',md_autentificacion.Auth, facturasController.MostrarFacturasUsuarios);

//MOSTRAR PRODUCTOS FACTURAS
api.get('/mostrarProductosFacturas/:idFactura',md_autentificacion.Auth, facturasController.MostrarProductosFacturas);

//MOSTRAR PRODUCTOS AGOTADOS
api.get('/mostrarProductosAgotados',md_autentificacion.Auth, facturasController.MostrarProductosAgotados);

//BUSCAR PRODUCTOS VENDIDOS
api.get('/productosVendidos',md_autentificacion.Auth,facturasController.BuscarProductosVendidos)

module.exports = api