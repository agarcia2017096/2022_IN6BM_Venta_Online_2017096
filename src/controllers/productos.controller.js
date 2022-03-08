//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2
const Categorias = require('../models/categorias.model');
const Productos = require('../models/productos.model');
//• Puede agregar un nuevo producto en la base de datos.
/* | | | | | | | | | | | | | | | | | | | | | PRODUCTOS CRUD - OPCIONES DE ADMINISTRADOR| | | | | | | | | | | | | | | | | | | | |*/
//*************************** 1. REGISTRAR PRODUCTOS *************************** */
function RegistrarProductos(req, res) {

    if ( req.user.rol == "ROL_CLIENTE" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a registar Productos. Únicamente el Administrador puede hacerlo.'});

    var parametros = req.body;

    if(parametros.nombreProducto && parametros.marca && 
        parametros.stock && parametros.precio&&parametros.descripcion&&parametros.nombreCategoria&& 
        parametros.nombreProducto !=""&& parametros.marca!="" && 
        parametros.stock!="" && parametros.precio!=""&&parametros.descripcion!=""&&parametros.nombreCategoria!="") {

            Productos.find({ nombreProducto : parametros.nombreProducto},{marca:parametros.marca}
                ,{descripcion:parametros.descripcion}, (err, empresaEncontrada) => {
                if ( empresaEncontrada.length == 0 ) {
                    Categorias.findOne({ nombreCategoria: parametros.nombreCategoria}, (err, productosEncontrada)=>{
                        if(err) return res.status(400).send({ mensaje: 'Error en la peticion'});
                        if(!productosEncontrada) return res.status(400).send ({ mensaje: 'Esta productos no existe. Verifique el nombre'})
                        var productosModel = new Productos();
                        productosModel.nombreProducto = parametros.nombreProducto;
                        productosModel.marca = parametros.marca;
                        productosModel.descripcion = parametros.descripcion;
                        productosModel.stock = parametros.stock;
                        productosModel.precio = parametros.precio;
                        productosModel.idCategoria = productosEncontrada._id;
                        
                        productosModel.save((err, empresaGuardada) => {
                            if (err) return res.status(500)
                                .send({ mensaje: 'Error en la peticion' });
                            if(!empresaGuardada) return res.status(500)
                                .send({ mensaje: 'Error al agregar la empresa'});
                            
                            return res.status(200).send({ empresa: empresaGuardada });
                        }); 
                    })
                 
                } else {
                    return res.status(500)
                        .send({ mensaje: 'Este producto ya existe. Ingrese otro nombre, marca y descripción de producto para el registro. ' });
                }
            })
    }else{
        return res.status(500)
        .send({ mensaje: 'Debe llenar los campos necesarios (nombreProducto, marca, descripción, stock, precio y nombreCategoria). Además, los campos no pueden ser vacíos'});
    }
}

//   Poderlo visualizar él y los productos.
//********************************* 2 BUSCAR TODOS LOS PRODUCTOS ********************************* */
function ObtenerTodosProductos(req, res) {

    if ( req.user.rol == "ROL_CLIENTE" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a buscar Productos. Únicamente el Administrador puede hacerlo'});

    Productos.find((err, productosEncontradas) => {
        if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if(!productosEncontradas) return res.status(500).send({ mensaje: "Error al obtener los productos."});
        return res.status(200).send({ productos: productosEncontradas })
    }).populate("idCategoria","nombreCategoria descripcionCategoria" )
}

//********************************* 3 BUSCAR PRODUCTOS POR ID ********************************* */
function ObtenerProductoId(req, res){
    var idProd =req.params.idProducto;

    if ( req.user.rol == "ROL_CLIENTE" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a buscar Productos. Únicamente el Administrador puede hacerlo'});

    Productos.findOne({_id:idProd},(err,productoEncontrado)=>{
        if(err) return res.status(500).send({mensaje: "El producto no existe. Verifique el ID"})
        if(!productoEncontrado) return res.status(500).send({mensaje: "El producto no existe. Verifique el ID"})
        console.log(productoEncontrado)
        return res.status(200).send({producto: productoEncontrado})

    }).populate("idCategoria","nombreCategoria descripcionCategoria")
}

//**************************** 3. EDITAR CATEGORIAS ******************************* */
function EditarCategorias(req, res) {
    var idCat = req.params.idCategoria;
    var parametros = req.body;

    if ( req.user.rol == "ROL_CLIENTE" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a editar Categorias. Únicamente el Administrador puede hacerlo'});

    Categorias.findOne({_id:idCat}, (err,buscarCategoria)=>{
        if(!buscarCategoria||err)return res.status(404).send( { mensaje: 'La productos no existe, verifique el ID'});

        if(parametros.nombreCategoria==""|| parametros.descripcionCategoria=="") return res.status(500)
        .send({ mensaje: 'Los campos no pueden ser vacíos'});
    
        if(parametros.idUsuario|| parametros.idUsuario==""){
            return res.status(500)
            .send({ mensaje: 'Solamente se pueden editar los campos de nombre y descripción'});
    
        }else{
        if(!buscarCategoria||err)return res.status(404).send( { mensaje: 'La productos no existe, verifique el ID'});
            if(buscarCategoria.idUsuario !=req.user.sub) return res.status(500).send({mensaje:"No se pueden editar otras productoss que no pertenecen al usuario Logueado"})
            Categorias.find({ nombreCategoria : parametros.nombreCategoria }, (err, productosEncontrada) => {
                if ( productosEncontrada.length == 0 ) {
                    parametros.idUsuario = req.user.sub
                    Categorias.findByIdAndUpdate({_id:idCat}, parametros, { new: true } ,(err, productosActualizada) => {
                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion'});
                        if(!productosActualizada) return res.status(404).send( { mensaje: 'Error al editar la productos'});
                
                        return res.status(200).send({ productos: productosActualizada});
                    });
                } else {
                    return res.status(500)
                        .send({ mensaje: 'Este nombre de categoría, ya  se encuentra utilizado. Según la política de la empresa, no es posible repetir nombres de categoría.' });
                }
            })
        }
    })
}

//********************************* 4. ELIMINAR CATEGORIAS ********************************* */
function EliminarCategorias(req, res){
    const idCat = req.params.idCategoria;

    if ( req.user.rol == "ROL_CLIENTE" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a eliminar Categorias. Únicamente el Administrador puede hacerlo'});

    Categorias.find({_id:idCat},(err,productosExistente)=>{
        if(err) return res.status(404).send({mensaje:'Error, la productos no existe. Verifique el ID'})
        if(productosExistente.length==0) return res.status(500).send({mensaje:"La productos no existe"})

        Categorias.findOne({nombreCategoria:"CATEGORÍA - POR DEFECTO"},(err,productosEncontrada)=>{
            if(err) return res.status(400).send({mensaje:'Error en la peticion de buscar productos por defecto'})
            if(!productosEncontrada){
               const modeloCategorias = new Categorias()
               modeloCategorias.nombreCategoria = "CATEGORÍA - POR DEFECTO"
               modeloCategorias.descripcionCategoria = "Categorías por defecto"
               modeloCategorias.idUsuario = null;

                modeloCategorias.save((err,productosGuardada)=>{
                   if(err) return res.status(400).send({mensaje:'Error en la peticion de guardar la productos por defecto'})
                   if(!productosGuardada) return res.status(400).send({mensaje:'No se ha podido agregar la productos'})

                  Productos.updateMany({idCategoria:idCat},{idCategoria:productosGuardada.id},(err,productossActualizadas)=>{
                    if(err) return res.status(400).send({mensaje:'Error en la peticion de actualizar '})

                    Categorias.findByIdAndDelete(idCat,(err,productosEliminada)=>{
                        if(err) return res.status(400).send({mensaje:'Error en la peticion al eliminar '})
                        if(!productosEliminada) return res.status(400).send({mensaje:'No se ha podido eliminar el productos'})
                        return res.status(200).send({editado:productossActualizadas,productos:productosEliminada})

                    })


                })
               })

            }else{
            Productos.updateMany({idCategoria:idCat},{idCategoria:productosEncontrada._id},(err,productosEncontrada)=>{
                if(err) return res.status(400).send({mensaje:'Error en la peticion de actualizar '})
                Categorias.findByIdAndDelete(idCat,(err,productosEliminada)=>{
                    if(err) return res.status(400).send({mensaje:'Error en la peticion al eliminar '})
                    if(!productosEliminada) return res.status(400).send({mensaje:'No se ha podido eliminar el curso'})
                    return res.status(200).send({curso:productosEliminada})
                })
            })

         }      

        })
    })

}

        
//********************************* EXPORTAR ********************************* */
module.exports ={
    RegistrarProductos,
    ObtenerTodosProductos,
    EditarCategorias,
    EliminarCategorias,
    ObtenerProductoId
    

}