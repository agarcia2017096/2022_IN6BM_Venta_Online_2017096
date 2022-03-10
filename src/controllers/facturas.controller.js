//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const Facturas = require('../models/facturas.model');
const Carritos = require('../models/carritos.model');
const Productos = require('../models/productos.model');


//Creacion de factura y reducción de stock
/* | | | | | | | | | | | | | | | | | | | | | FACTURAS CRUD - OPCIONES DE CLIENTE| | | | | | | | | | | | | | | | | | | | |*/
//*************************** 1. REGISTRAR FACTURA *************************** */
function RegistarFactura(req, res) {
    var parametros = req.body
    if ( req.user.rol == "ROL_ADMINISTRADOR" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a registar Facturas. Únicamente el Cliente puede hacerlo.'});

    Carritos.findOne({idUsuario:req.user.sub},(err, carritoUsuario)=>{
        if(err) return res.status(500).send({ mensaje:"Error en la peticion"})
        if(!carritoUsuario) return res.status(500).send({ mensaje:"El usuario no posee carritos, no puede acceder a crear facturas, debe crear un carrito"})
        if(carritoUsuario.compras.length==0) return res.status(500).send({mensaje:"No existen productos en el carrito del usuario "})

        
        if(!parametros.nit||parametros.nit==""){
            return res.status(500).send({ mensaje:"Debe llenar el campo nit para generar la factura"})
        }else{
            var finalFord = 0                                    
            for (let i = 0; i <carritoUsuario.compras.length;i++){

                if ( carritoUsuario.idUsuario == req.user.sub){
                    finalFord++ 
                    var modelFactura = new Facturas()
                    modelFactura.nit = parametros.nit
                    modelFactura.fecha = Date.now()
                    modelFactura.compras = carritoUsuario.compras
                    modelFactura.total =carritoUsuario.total
                    modelFactura.idUsuario = req.user.sub

                    let limpiarCarrito = []

                    var restarStock = (carritoUsuario.compras[i].productos.cantidad * -1)
                    console.log(restarStock)
                    var cantidadVendido = carritoUsuario.compras[i].productos.cantidad


                    Carritos.findOneAndUpdate({_id:carritoUsuario._id},  { compras: limpiarCarrito , total: 0 }, { new: true }, 
                        (err, carritoVacio)=>{
                            Productos.findByIdAndUpdate(carritoUsuario.compras[i].productos.idProducto, { $inc : { stock: restarStock,vendido:cantidadVendido } }, { new: true },
                                (err, productoModificado) => {
                                    if(!productoModificado) return res.status(500).send({ mensaje: 'Error al editar editar productos'});
                                    if(err) return res.status(500).send({ mensaje:"Error en la peticion"})
                            })

                        })
                }
                if(finalFord==carritoUsuario.compras.length){
                    modelFactura.save((err,agregarFactura)=>{

                        if(!agregarFactura) return res.status(500).send({ mensaje:"No se puede guardar el carrito"})
                        return res.status(200).send({mensaje:"El carrito del cliente se encuntra vacío",factura:agregarFactura})
                    })//.populate('idUsuario','nombre')
                }
            }
            
        }

    })
}

//*************************** 2. MOSTRAR FACTURA *************************** */
function MostrarFacturas(req, res){
    if ( req.user.rol == "ROL_ADMINISTRADOR" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a buscar Facturas. Únicamente el Cliente puede visualizar sus facturas'});

    Facturas.find({idUsuario:req.user.sub}, (err, facturasEncontradas) => {
        if(err) return res.status(500).send({ mensaje: "Error en la peticion, no existen facturas del cliente" });
        if(!facturasEncontradas||facturasEncontradas.length==0) return res.status(500).send({ mensaje: "El cliente no posee facturas."});
        return res.status(200).send({ facturas: facturasEncontradas })
    }).populate('idUsuario',"nombre")
}

        
//********************************* EXPORTAR ********************************* */
module.exports ={
    RegistarFactura,
    MostrarFacturas
    

}