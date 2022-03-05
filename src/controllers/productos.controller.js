//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const Productos = require('../models/productos.model');


//• Puede agregar un nuevo producto en la base de datos.
/* | | | | | | | | | | | | | | | | | | | | | EMPRESAS CRUD - OPCIONES DE ADMINISTRADOR| | | | | | | | | | | | | | | | | | | | |*/
//*************************** 1. REGISTRAR PRODUCTOS *************************** */
function RegistrarEmpresas(req, res) {

    if ( req.user.rol == "ROL_CLIENTE" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a registar Empresas. Únicamente el Administrador'});

    var parametros = req.body;
    var productosmodel = new Productos();

    if(parametros.nombreProducto && parametros.marca && 
        parametros.stock && parametros.precio) {
            productosmodel.nombreProducto = parametros.nombreProducto;
            productosmodel.marca = parametros.marca;
            productosmodel.stock = parametros.stock;
            productosmodel.precio = parametros.precio;
            productosmodel.imagen = null;
            productosmodel.idUsuario = req.user.sub;

            Empresas.find({ nombreProducto : parametros.nombreProducto},{marca:parametros.marca}, (err, empresaEncontrada) => {
                if ( empresaEncontrada.length == 0 ) {

                        productosmodel.save((err, empresaGuardada) => {
                            if (err) return res.status(500)
                                .send({ mensaje: 'Error en la peticion' });
                            if(!empresaGuardada) return res.status(500)
                                .send({ mensaje: 'Error al agregar la empresa'});
                            
                            return res.status(200).send({ empresa: empresaGuardada });
                        });                  
                } else {
                    return res.status(500)
                        .send({ mensaje: 'Este correo, ya  se encuentra utilizado' });
                }
            })
    }else{
        return res.status(500)
        .send({ mensaje: 'Debe llenar los campos necesarios'});
    }
}