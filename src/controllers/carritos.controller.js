//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const Carritos = require('../models/carritos.model');
const Productos = require('../models/productos.model');
const mongoose = require('mongoose');


/* | | | | | | | | | | | | | | | | | | | | | PRODUCTOS CRUD - OPCIONES DE ADMINISTRADOR| | | | | | | | | | | | | | | | | | | | |*/
//*************************** 1. REGISTRAR PRODUCTOS *************************** */
function RegistrarCarrito(req, res) {
    //VERIFICA SI ES CLIENTE
    if ( req.user.rol == "ROL_ADMINISTRADOR" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a registar Carritos. Únicamente el Cliente puede hacerlo.'});
    //OBTENCION DE PARAMETROS
    var parametros = req.body;
    //VERIFICA SI EXISTE EL CARRITO DE MI USUARIO
    Carritos.findOne({idUsuario:req.user.sub},(err, carritoUsuario)=>{
    if(err) return res.status(500).send({ mensaje: 'Error al agregar carrito  '});
        if(carritoUsuario==null) {//CREAR CARRITO PARA USUARIO

            var carritoModel = new Carritos();
            carritoModel.idUsuario = req.user.sub;
            carritoModel.total = 0
            //GUARDA UN CARRITO PARA USUARIO
            carritoModel.save((err, carrritoUsuario) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                if(!carrritoUsuario) return res.status(500).send({ mensaje: 'Error al agregar la carrito'});
                //VERIFICA PARAMETROS OBLIGATORIOS
                if(parametros.nombreProducto && parametros.cantidad
                &&parametros.descripcion!=""&&parametros.nombreCategoria!="") {
                    //VERIFICA SI EL PRODUCTO EXISTE
                        Productos.findOne({ nombreProducto : parametros.nombreProducto}, (err, productoEncontrado) => {
                            if(err) return res.status(500).send({ mensaje: 'Error en la peticion, no existe el producto'});
                            if(!productoEncontrado) return res.status(500).send ({ mensaje: 'Este producto no existe. Verifique el nombre'})
                            //SI EL PRODUCTO EXISTE
                            if ( productoEncontrado.length != 0 ) {//PRODUCTO EXISTE
                                //BUSCO EN CARRITO EL ID_USUARIO
                                Carritos.findOne({idUsuario:req.user.sub}, (err, productoCarrito) => {
                                    console.log(productoCarrito.compras.length===0)
                                        //VERIFICA SI EL ARRAY DE PRODUCTO ESTA VACIO
                                        if ( productoCarrito.compras.length===0) {//EL PRODUCTO NO SE ENCUNTRA EN EL CARRITO
                                            //VERIFICA SI LA CANTIDAD ES 0
                                            if(parametros.cantidad<=0) return res.status(500).send({ mensaje: 'La cantidad no puede ser menor o igual a cero'});
                                            //VERIFICA QUE LA CANTIDAD MENOR O IGUAL QUE ESTOCK
                                            if(parametros.cantidad>productoEncontrado.stock){//VERIFICAR STOCK
                                                //PRODUCTO AGOTADO
                                                if(productoEncontrado.stock==0) return res.status(500).send({ mensaje: 'Producto agotado. No es posible agregar el producto.'})
    
                                                return res.status(500).send({ mensaje: 'La cantidad ingresada es mayor al stock. Prodcutos en existencia:'+productoEncontrado.stock});
                                            }
                                            //MULTIPLICACION DEL SUBTOTAL
                                            var subtotalAgregar = (parametros.cantidad*productoEncontrado.precio)
                                            //MODIFICA EL ARRAY Y AGAREGA PRODUCTO
                                            Carritos.findByIdAndUpdate({_id:carrritoUsuario._id},{ total: (productoCarrito.total+ subtotalAgregar), 
                                                $push: {
                                                    compras: [{
                                                        productos:
                                                        {idProducto:productoEncontrado._id,nombreProducto: productoEncontrado.nombreProducto,
                                                        cantidad: parametros.cantidad, precio: productoEncontrado.precio,subTotal: (parametros.cantidad*productoEncontrado.precio) }

                                                    }]
                                                } 
                                            }, { new: true},  
                                                (err, carritoActualizado)=>{  
                                                    if(err) return res.status(500).send({ mensaje: "Error en la peticion de modificar carrito"});
                                                    if(!carritoActualizado) return res.status(500).send({ mensaje: 'Error al modificar el carrito'});
                            
                                                    return res.status(200).send({ mensaje:"Se ha creado el carrito para el usuario",carrito: carritoActualizado })
                                            }).populate('idUsuario','nombre apellido email');                                    
                
                                        }else{
                                            return res.status(200).send({ mensaje: "Falla en registar carrito"})
                                        }
                                })
                            } else {
                                return res.status(500)
                                    .send({ mensaje: 'Este producto no existe. Ingrese otro nombre.' });
                            }
                        })                               
                }else{
                    return res.status(500)
                    .send({ mensaje: 'Debe llenar los campos necesarios (nombreProducto, cantidad)'});
                }

            }); 

        }else{//ESTE USUARIO POSEE UN CARRITO
            //VERIFICA PARAMETROS OBLIGATORIOS
            if(parametros.nombreProducto && parametros.cantidad&&parametros.descripcion!=""&&parametros.nombreCategoria!="") {
                    //BUSCA EXISTENCIA DE PRODUCTO
                    Productos.findOne({ nombreProducto : parametros.nombreProducto}, (err, productoEncontrado) => {
                        if(err) return res.status(500).send({ mensaje: 'Error en la peticion, no existe el producto'});
                        if(!productoEncontrado) return res.status(500).send ({ mensaje: 'Este producto no existe. Verifique el nombre'})
                        //VERIFICA SI EL PRODUCTO EXISTE
                        if ( productoEncontrado != 0 ) {//PRODUCTO EXISTE
                            
                            Carritos.findOne({idUsuario:carritoUsuario.idUsuario}, (err, productoCarrito) => {
                                if(err) console.log(err)
                                if(!productoCarrito) console.log(productoCarrito)

                                //VERIFICACION SI PRODUCTO ESTA EN CARRITO
                                if ( productoCarrito.compras ===0||productoCarrito.compras.length==0) {//NO HAY PRODUCTOS EN EL CARRITO
                                    //VERIFICAR QUE LA CANTIDAD 
                                    if(parametros.cantidad<=0) return res.status(500).send({ mensaje: 'La cantidad no puede ser menor o igual a cero'});
                                    if(parametros.cantidad>productoEncontrado.stock){//VERIFICAR STOCK

                                        if(productoEncontrado.stock==0) return res.status(500).send({ mensaje: 'Producto agotado. No es posible agregar el producto.'})

                                        return res.status(500).send({ mensaje: 'La cantidad ingresada es mayor al stock. Prodcutos en existencia:'+productoEncontrado.stock});
                                    }

                                    var subtotalAgregar = (parametros.cantidad*productoEncontrado.precio)
                                    //EDICION CARRITO DEL CARRITO
                                    console.log("Ejecucion de no hay productos en carrito")
                                    Carritos.findByIdAndUpdate({_id:productoCarrito._id},{ total: (productoCarrito.total+ subtotalAgregar), 
                                        $push: {
                                            compras: [{
                                                productos:
                                                {idProducto:productoEncontrado._id,nombreProducto: productoEncontrado.nombreProducto,
                                                cantidad: parametros.cantidad, precio: productoEncontrado.precio,subTotal: (parametros.cantidad*productoEncontrado.precio) }

                                            }]
                                        } 
                                    }, { new: true},  
                                        (err, carritoActualizado)=>{  
                                            if(err) return res.status(500).send({ mensaje: "Error en la peticion de modificar carrito"});
                                            if(!carritoActualizado) return res.status(500).send({ mensaje: 'Error al modificar el carrito'});
                    
                                            return res.status(200).send({ carrito: carritoActualizado })
                                    }).populate('idUsuario','nombre apellido email');                                    
        
                                
                                }else{//HAY OTROS PRODUCTOS EN EL CARRITO
                                    console.log("Ejecucion de hay mas productos en carrito")
                                    // RECORRE EL ARRay - ENCONTRAR COINCIDENCIAS
                                    for (let i = 0; i <productoCarrito.compras.length;i++){
                                        //VERIFICA SI EL PRODUCTO EXISTE

                                        //SI EL PRODUCTO YA ESTA EN UN OBJETO - CAMBIAR CANTIDAD Y TOTALES
                                        if ( productoCarrito.compras[i].productos.nombreProducto == productoEncontrado.nombreProducto){
                                            console.log("El producto es ya se encuntra en el carrito")
                                                var idProducto =productoCarrito.compras[i].productos.idProducto
                                                var cantidadAnterior = productoCarrito.compras[i].productos.cantidad

                                                var cantidadNueva = 0

                                                cantidadNueva = ( (parseInt(cantidadAnterior))+(parseInt(parametros.cantidad)))                                               
                                                
                                                //CANTIDAD INGRESADA NO PUEDE SER 0 
                                                if(cantidadNueva<=0) return res.status(500).send({ mensaje: 'La cantidad no puede ser menor o igual a cero.Ingrese otra cantidad'});

                                                if(cantidadNueva>productoEncontrado.stock){//VERIFICAR STOCK
        
                                                    if(productoEncontrado.stock==0) return res.status(500).send({ mensaje: 'Producto agotado. No es posible agregar el producto.'})
        
                                                    return res.status(500).send({ mensaje: 'La cantidad ingresada es mayor al stock. Prodcutos en existencia :'+productoEncontrado.stock});
                                                }
                                                if(cantidadNueva<0) return res.status(500).send({ mensaje: 'La cantidad no puede ser menor a 0.Ingrese otra cantidad. Stock de producto :'+productoEncontrado.stock});

                                                
                                                var subtotalAgregarNuevo = (parametros.cantidad*productoEncontrado.precio)
                                                Carritos.findOneAndUpdate({idUsuario:productoCarrito.idUsuario},{total: ( productoCarrito.total +subtotalAgregarNuevo), 
                                                     //NO SE USA PUL DEBIADO A QUE SE DEBE MODIFICAR SOLO CANTIDAD 
                                                        compras: [{
                                                             productos:                                                             
                                                            {idProducto:productoEncontrado._id,nombreProducto: productoEncontrado.nombreProducto,
                                                             cantidad: cantidadNueva , precio: productoEncontrado.precio,subTotal: (productoCarrito.compras[i].productos.subTotal+(parametros.cantidad*productoEncontrado.precio)) }
        
                                                        }]
                                                    
                                                    }, { new: true}, 
                                                    (err, carritoAgregadoProductoExistente) => {
                                                        console.log(carritoAgregadoProductoExistente)
                                                        if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
                                                        console.log(carritoAgregadoProductoExistente)
                                                        if(!carritoAgregadoProductoExistente) return res.status(500).send({ mensaje: 'Error al editar la cantidad del Producto'});
                                            //////////////////////////////////
                                                        return res.status(200).send({mensaje:'PRODUCTO DE CARRITO MODIFICADO', carrito: carritoAgregadoProductoExistente});
                                                    }).populate('idUsuario','nombre apellido email');  
        
                                        }else{//PROUCTO NUEVO A CARRITO
                                            console.log("El producto no se encuntra")
                                             nuevoProducto = true
                                             console.log("El producto es nuevo y se agrega")
                                             if(parametros.cantidad<=0) return res.status(500).send({ mensaje: 'La cantidad no puede ser menor o igual a cero'});
                                             if(parametros.cantidad>productoEncontrado.stock){//VERIFICAR STOCK
         
                                                 if(productoEncontrado.stock==0) return res.status(500).send({ mensaje: 'Producto agotado. No es posible agregar el producto.'})
         
                                                 return res.status(500).send({ mensaje: 'La cantidad ingresada es mayor al stock. Prodcutos en existencia: '+productoEncontrado.stock});
                                             }
                                             var subtotalAgregarProd = (parametros.cantidad*productoEncontrado.precio)
                                             Carritos.findByIdAndUpdate({_id:productoCarrito._id},{ total: (productoCarrito.total + subtotalAgregarProd), 
                                                 $push: {
                                                     compras: [{
                                                         productos:
                                                         {idProducto:productoEncontrado._id,nombreProducto: productoEncontrado.nombreProducto,
                                                         cantidad: parametros.cantidad, precio: productoEncontrado.precio,subTotal: (parametros.cantidad*productoEncontrado.precio) }
         
                                                     }]
                                                 } 
                                             }, { new: true},  
                                                 (err, carritoActualizado)=>{  
                                                     if(err) return res.status(500).send({ mensaje: "Error en la peticion de modificar carrito"});
                                                     if(!carritoActualizado) return res.status(500).send({ mensaje: 'Error al modificar el carrito'});
                             
                                                     return res.status(200).send({ carrito: carritoActualizado })
                                             }).populate('idUsuario','nombre');      
                                        }
                                    }
                                }

                            })

                        } else {
                            return res.status(500)
                                .send({ mensaje: 'Este producto no existe. Ingrese otro nombre.' });
                        }
                    })                               
            }else{
                return res.status(500)
                .send({ mensaje: 'Debe llenar los campos necesarios (nombreProducto, cantidad) -'});
            }
        }
    })
}

//*************************** 2. ELIMINAR PRODUCTOS CARRITO *************************** */
function EliminarProductoCarrito(req, res) {
    var idProd = req.params.idProducto

    if ( req.user.rol == "ROL_ADMINISTRADOR" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a registar Carritos. Únicamente el Cliente puede hacerlo.'});
    //VERIFICA SI EL USUARIO POSEE CARIITO
    Carritos.findOne({idUsuario:req.user.sub},(err, carritoUsuario)=>{
        if(err) return res.status(500).send({ mensaje:"Error en la peticion, el usuario no posee carritos"})
        if(!carritoUsuario) return res.status(500).send({ mensaje:"El usuario no posee carritos, no puede acceder a esta función"})
            //VERIFICA SI EL PRODUCTO INGRESADO EXISTE EN EL ARRAY DE CARRITO
            console.log(carritoUsuario.compras.length)
            var finalFord = 0                                    
               //RECORRE EL ARRAY
                for (let i = 0; i <carritoUsuario.compras.length;i++){
                        if ( carritoUsuario.compras[i].productos.idProducto == idProd){
                            console.log("producto existe "+carritoUsuario.compras[i].productos.idProducto)
                            var idELiminar = carritoUsuario.compras[i]._id
                            console.log(idELiminar)

                            var totalModificado = ((carritoUsuario.total)-(carritoUsuario.compras[i].productos.subTotal))
                            Carritos.findOneAndUpdate({_idUsuarioid:req.user.sub},{total:totalModificado,
                                $pull: {
                                    compras: {_id:idELiminar}
                                }
                            }, { new: true},  
                                (err, carritoActualizado)=>{  
                                    console.log(err)
                                    if(err) return res.status(500).send({ mensaje: "Error en la peticion de modificar carrito"});
                                    if(!carritoActualizado) return res.status(500).send({ mensaje: 'Error al modificar el carrito'});
            
                                    return res.status(200).send({ carrito: carritoActualizado })
                            }).populate('idUsuario','nombre');
                        }else{
                            finalFord++ 
                            console.log("ford "+finalFord)                                 
                            if(finalFord == carritoUsuario.compras.length){
                                return res.status(200).send({mensaje:'El producto no existe en el carrito'})
                            }
                        }
                    
                }

        })


}



//********************************* EXPORTAR ********************************* */
module.exports ={
    RegistrarCarrito,
    EliminarProductoCarrito
    

}