//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const GenerarPDF = require('../generarPDF/generarPDF');
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
                    var fechas = new Date(rt)
                    modelFactura.fecha =  (fechaActual(fechas))
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
                        GenerarPDF.facturasPDF(carritoUsuario.idUsuario,agregarFactura._id)
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
    }).populate('idUsuario',"nombre apellido email")
}

/* | | | | | | | | | | | | | | | | | | | | | GESTION FACTURAS  - OPCIONES DE administrador| | | | | | | | | | | | | | | | | | | | |*/
//*************************** 1. MOSTRAR FACTURAS QUE TIENEN SUS USUARIO *************************** */
function MostrarFacturasUsuarios(req, res){
    if ( req.user.rol == "ROL_CLIENTE" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a buscar Facturas de Usuarios. Únicamente el Administrador puede hacerlo'});

    Facturas.find({}, (err, facturasEncontradas) => {
        if(err) return res.status(500).send({ mensaje: "Error en la peticion, no existen facturas de usuarios" });
        if(!facturasEncontradas||facturasEncontradas.length==0) return res.status(500).send({ mensaje: "Los usuarios no poseen facturas."});
        return res.status(200).send({mensaje:"FACTURAS  QUE TIENE LOS USUARIOS", facturas: facturasEncontradas.sort()})
    }).populate('idUsuario',"nombre apellido email rol")
}

//*************************** 2. MOSTRAR FACTURAS QUE TIENEN SUS USUARIO *************************** */
function MostrarProductosFacturas(req, res){
    var idFac = req.params.idFactura
    if ( req.user.rol == "ROL_CLIENTE" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a buscar Producto de una factura. Únicamente el Administrador puede hacerlo'});

    Facturas.findOne({_id:idFac}, (err, facturasEncontradas) => {
        if(err) return res.status(500).send({ mensaje: "Error en la peticion, no existen factura" });
        if(!facturasEncontradas||facturasEncontradas.length==0) return res.status(500).send({ mensaje: "La factura no existe. Verifique el ID."});
        return res.status(200).send({mensaje:"FACTURA: "+idFac, facturas: facturasEncontradas.compras})
    })
}

//*************************** 3. MOSTRAR FACTURAS QUE TIENEN SUS USUARIO *************************** */
function MostrarProductosAgotados(req, res){
    if ( req.user.rol == "ROL_CLIENTE" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a buscar Productos Agotados. Únicamente el Administrador puede hacerlo'});

    Productos.find({stock:0}, (err, productosAgotados) => {
        if(err) return res.status(500).send({ mensaje: "Error en la peticion, no existen productoas agotados." });
        if(!productosAgotados||productosAgotados.length==0) return res.status(500).send({ mensaje: "No existen productoas agotados."});
        return res.status(200).send({mensaje:"PRODUCTOS AGOTADOS: "+productosAgotados.length, productos: productosAgotados})
    }).populate("idCategoria","nombreCategoria descripcionCategoria")
}

function fechaActual(date) {
  
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
  
    return day + "/" + month + "/" + year;
  
}
        
//********************************* EXPORTAR ********************************* */
module.exports ={
    RegistarFactura,
    MostrarFacturas,
    MostrarFacturasUsuarios,
    MostrarProductosFacturas,
    MostrarProductosAgotados    

}