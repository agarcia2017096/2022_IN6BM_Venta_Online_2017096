//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const Facturas = require('../models/facturas.model');
const Carritos = require('../models/carritos.model');

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

        if(!parametros.nit||parametros.nit==""){
            return res.status(500).send({ mensaje:"Debe llenar el campo nit para generar la factura"})
        }else{

            console.log(carritoUsuario.compras.length)

            for (let i = 0; i <carritoUsuario.compras.length;i++){
                console.log(carritoUsuario)
                console.log(carritoUsuario.idUsuario)
                console.log(req.user.sub)

                if ( carritoUsuario.idUsuario == req.user.sub){
                    var modelCarrito =  Carritos()
                    var modelFactura = new Facturas()
                    modelFactura.nit = parametros.nit
                    modelFactura.fecha = Date.now()
                    modelFactura.compras = carritoUsuario.compras
                    modelFactura.total =carritoUsuario.total

                    Carritos.findOneAndUpdate({_id:carritoUsuario._id}, { $set: { compras: [] }, total: 0 }, { new: true }, 
                        (err, carritoVacio)=>{

                            modelFactura.save((err,agregarFactura)=>{
                                if(err) return res.status(500).send({ mensaje:"Error en la peticion"})
                                if(!agregarFactura) return res.status(500).send({ mensaje:"No se puede guardar el carrito"})
                                return res.status(200).send({factura:agregarFactura})
                            })


                        })
                }
            }
        }

    })
}

        
//********************************* EXPORTAR ********************************* */
module.exports ={
    RegistarFactura
    

}