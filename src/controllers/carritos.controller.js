//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const Carritos = require('../models/carritos.model');
const Productos = require('../models/productos.model');

/* | | | | | | | | | | | | | | | | | | | | | PRODUCTOS CRUD - OPCIONES DE ADMINISTRADOR| | | | | | | | | | | | | | | | | | | | |*/
//*************************** 1. REGISTRAR PRODUCTOS *************************** */
function RegistrarCarrito(req, res) {

    if ( req.user.rol = "ROL_ADMINISTRADOR" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a registar Carritos. Únicamente el Cliente puede hacerlo.'});

    var parametros = req.body;

    if(parametros.nombreProducto && parametros.cantidad
        &&parametros.descripcion!=""&&parametros.nombreCategoria!="") {

            Productos.findOne({ nombreProducto : parametros.nombreProducto}, (err, productoEncontrado) => {
                if(err) return res.status(500).send({ mensaje: 'Error en la peticion, no existe el producto'});
                if(!productoEncontrado) return res.status(500).send ({ mensaje: 'Este producto no existe. Verifique el nombre'})

                if ( productoEncontrado.length != 0 ) {//PRODUCTO EXISTE

                    Carritos.findOne({ nombreProducto : parametros.nombreProducto}, (err, productoCarrito) => {

                        if ( productoCarrito.length ==0 ) {//EL PRODUCTO NO SE ENCUNTRA EN EL CARRITO

                            if(parametros.cantidad>productoEncontrado.stock){//VERIFICAR STOCK
                                if(productoEncontrado.stock==0) return res.status(500).send({ mensaje: 'Producto agotado. No es posible agregar el producto.'+productoEncontrado.stock})
                        
                                return res.status(500).send({ mensaje: 'La cantidad ingresada es mayor al stock. Prodcutos en existencia:'+productoEncontrado.stock});
                            }

                            var carritoModel = new Carritos();
                                carritoModel.nombreProducto = productoEncontrado.nombreProducto;
                                carritoModel.cantidad = parametros.cantidad;
                                carritoModel.precio = productoEncontrado.precio;
                                carritoModel.subTotal = (parametros.cantidad*productoEncontrado.precio);
                                carritoModel.total = productoCarrito.total + subTotal
                        
                             carritoModel.save((err, empresaGuardada) => {
                                if (err) return res.status(500)
                                    .send({ mensaje: 'Error en la peticion' });
                                if(!empresaGuardada) return res.status(500)
                                    .send({ mensaje: 'Error al agregar la empresa'});
                            
                                return res.status(200).send({ empresa: empresaGuardada });
                            }); 
                 
                        }else{//EL PRODUCTO YA SE ENCUNTRA EN EL CARRITO
                            

                        }
    
                    })

                } else {
                    return res.status(500)
                        .send({ mensaje: 'Este producto no existe. Ingrese otro nombre.' });
                }
            })
    }else{
        return res.status(500)
        .send({ mensaje: 'Debe llenar los campos necesarios (nombreProducto, marca, descripción, stock, precio y nombreCategoria). Además, los campos no pueden ser vacíos'});
    }
}


//********************************* EXPORTAR ********************************* */
module.exports ={
    RegistrarCarrito,

    

}