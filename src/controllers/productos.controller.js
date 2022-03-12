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
    if(parametros.vendido) return res.status(500).send({ mensaje: "EL campo vendido no se puede agregar" });
    if(parametros.stock<=0) return res.status(500).send({ mensaje: "EL stock debe ser mayor a 0. Verifique los datos"})
    if(parametros.precio <=0) return res.status(500).send({ mensaje: "Valor no válido para campo de precio" })

    if(parametros.nombreProducto && parametros.marca && 
        parametros.stock && parametros.precio&&parametros.descripcion&&parametros.nombreCategoria&& 
        parametros.nombreProducto !=""&& parametros.marca!="" && 
        parametros.stock!="" && parametros.precio!=""&&parametros.descripcion!=""&&parametros.nombreCategoria!="") {

            Productos.find({ nombreProducto : parametros.nombreProducto},{marca:parametros.marca}
                ,{descripcion:parametros.descripcion}, (err, productoEncontrado) => {
                
                if ( productoEncontrado.length == 0 ) {
                    Categorias.findOne({ nombreCategoria: parametros.nombreCategoria}, (err, categoriaEncontrada)=>{
                        if(err) return res.status(400).send({ mensaje: 'Error en la peticion'});
                        if(!categoriaEncontrada) return res.status(400).send ({ mensaje: 'Esta Categoría no existe. Verifique el nombre'})
                        var productosModel = new Productos();
                        productosModel.nombreProducto = parametros.nombreProducto;
                        productosModel.marca = parametros.marca;
                        productosModel.descripcion = parametros.descripcion;
                        productosModel.stock = parametros.stock;
                        productosModel.precio = parametros.precio;
                        productosModel.idCategoria = categoriaEncontrada._id;
                        
                        productosModel.save((err, productoGuardado) => {
                            if (err) return res.status(500)
                                .send({ mensaje: 'Error en la peticion' });
                            if(!productoGuardado) return res.status(500)
                                .send({ mensaje: 'Error al agregar la empresa'});
                            
                            return res.status(200).send({ mensaje:"REGISTRO DE PRODUCTO EXITOSO",producto: productoGuardado });
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
        return res.status(200).send({mensaje:"BUSQUEDA EXITOSA", productos: productosEncontradas })
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
        //console.log(productoEncontrado)
        return res.status(200).send({mensaje:"BUSQUEDA POR PROUCTO EXITOSA",producto: productoEncontrado})

    }).populate("idCategoria","nombreCategoria descripcionCategoria")
}

// Editar los productos producto.
//• Llevar el control de stock (cantidad) del producto y poderlo editarlo.
//**************************** 3. EDITAR PRODUCTOS ******************************* */
function EditarProductos(req, res) {
    var idProd = req.params.idProducto;
    var parametros = req.body;

    if ( req.user.rol == "ROL_CLIENTE" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a editar Productos. Únicamente el Administrador puede hacerlo'});

    console.log("ADVERTENCIA: Únicamente es posible aumentar la cantidad del Stock.")

    var nuevoStock = 0

    Productos.findOne({_id:idProd}, (err,buscarProductos)=>{
        if(!buscarProductos||err)return res.status(404).send( { mensaje: 'EL productos no existe, verifique el ID'});

        if(parametros.vendido) return res.status(500).send({ mensaje: "EL campo vendido no se puede agregar" })

        if(parametros.precio <=0) return res.status(500).send({ mensaje: "Valor no válido para campo de precio" })

        if(parametros.stock<=0) return res.status(500).send({ mensaje: "Para actualizar el stock debe ingresar la cantidad que desee que aumente el stock actual.",
        informacion: "Stock actual: "+buscarProductos.stock });

        if(parametros.nombreProducto ==""|| parametros.marca=="" || 
        parametros.stock=="" || parametros.precio==""||parametros.descripcion==""||parametros.nombreCategoria=="") return res.status(500).send({ mensaje: 'Los no pueden ser vacíos'});

        Productos.find({ nombreProducto : parametros.nombreProducto}, (err, productosEncontrados) => {
            if ( productosEncontrados.length == 0 ) {

                if(parametros.nombreProducto!=''|| parametros.marca!='' || 
                    parametros.stock!='' ||parametros.precio!=''||parametros.descripcion!=''||parametros.nombreCategoria!=''){

                            //console.log("Cate"+parametros.nombreCategoria)
                            if(parametros.nombreCategoria){
                                //console.log("ENTRA")
                                Categorias.findOne({ nombreCategoria: parametros.nombreCategoria}, (err, categoriaEncontrada)=>{
                                    if(err) return res.status(400).send({ mensaje: 'Error en la peticion'});
                                    if(!categoriaEncontrada) return res.status(400).send ({ mensaje: 'Esta Categoría no existe. Verifique el nombre'})
                                    //console.log(categoriaEncontrada._id)

                                    var idCategoria = categoriaEncontrada._id
                                    parametros.nombreCategoria = idCategoria

                                    Productos.findOneAndUpdate({_id:idProd},{idCategoria:categoriaEncontrada._id}, { new: true } ,(err, productoActualizado) => {
                                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de editar categoria--'});
                                        if(!productoActualizado) return res.status(404).send( { mensaje: 'Error al editar el categoria'});
                
                                 
        
                                    })

                                })
                            }

                            if(parametros.stock){
                                nuevoStock = (parseInt(buscarProductos.stock)+parseInt(parametros.stock))
                                parametros.stock = nuevoStock
                            }

                            //CONSTANTE
                            //console.log(parametros)
                            Productos.findOneAndUpdate({_id:idProd},parametros, { new: true } ,(err, productoActualizado) => {
                                if (err) return res.status(500).send({ mensaje: 'Error en la peticion--'});
                                if(!productoActualizado) return res.status(404).send( { mensaje: 'Error al editar el productos'});
        
                         
                                return res.status(200).send({ productos: productoActualizado});

                            }).populate("idCategoria","nombreCategoria descripcionCategoria")
        
        
                        
                    }
            } else {
                return res.status(500).send({ mensaje: 'Este producto ya existe. Ingrese otro nombre' });
            }
        })
        
    })
}

/* | | | | | | | | | | | | | | | | | | | | | PRODUCTOS  - OPCIONES DE CLIENTE| | | | | | | | | | | | | | | | | | | | |*/
//********************************* 1 BUSCAR PRODUCTOS POR NOMBRE ********************************* */
function ObtenerNombreProductos(req, res) {
    var nomProd = req.params.nombreProducto;

    if ( req.user.rol == "ROL_ADMINISTRADOR" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a buscar Productos. Solamente el cliente puede hacerlo'});

    Productos.find( { nombreProducto : { $regex: nomProd, $options: 'i' } }, (err, productoEncontrado) => {
        if(err) return res.status(500).send({ mensaje: "Error no se ha encontrado el nombre" });
        if(productoEncontrado==0) return res.status(404).send({ mensaje: "No existen productos con este nombre" });
        return res.status(200).send({ mensaje:"BUSQUEDA POR NOMBRE EXITOSA",producto: productoEncontrado })
    }).populate("idCategoria","nombreCategoria descripcionCategoria")
}

//********************************* 2 BUSCAR CATEGORÍAS ********************************* */
function ObtenerCategorias(req, res) {

    if ( req.user.rol == "ROL_ADMINISTRADOR" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a buscar Categorias. Solamente el cliente puede hacerlo'});

    Categorias.find({},(err, CategoriasEncontradas) => {
        if(err) return res.status(500).send({ mensaje: "Error, no se han encontradon categorías" });
        if(CategoriasEncontradas==0) return res.status(404).send({ mensaje: "Error, no se encontraron categorias" });
        return res.status(200).send({ mensaje:"BUSQUEDA EXITOSA",categoria: CategoriasEncontradas })
    })//.populate("idUsuario","nombre")
}

//********************************* 3 BUSCAR CATEGORÍAS POR NOMBRE ********************************* */
function ObtenerNombreCategorias(req, res) {
    var nomCat = req.params.nombreCategoria;

    if ( req.user.rol == "ROL_ADMINISTRADOR" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a buscar Categorías. Solamente el cliente puede hacerlo'});

    Categorias.find( { nombreCategoria : { $regex: nomCat, $options: 'i' } }, (err, categoriaEncontrada) => {
        if(err) return res.status(500).send({ mensaje: "Error no se ha encontrado el nombre" });
        if(categoriaEncontrada==0) return res.status(404).send({ mensaje: "No existen categorias con este nombre" });
        return res.status(200).send({mensaje:"BUSQUEDA DE CATEGORÍA POR NOMBRE EXITOSA", producto: categoriaEncontrada })
    })//.populate("idUsuario","nombre email")
}

//********************************* 4 BUSCAR PRODUCTOS MÁS VENDIDOS ********************************* */
function CatalogoProductosMasVendidos(req, res) {

    if ( req.user.rol == "ROL_ADMINISTRADOR" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a buscar Catalogo de prosuctos más venididos. Solamente el cliente puede hacerlo'});

    Productos.find({vendido:{$gte:0}},(err, productosVendidos) => {
        if(err) return res.status(500).send({ mensaje: "Error, No se han vendido productos" });
        if(productosVendidos.length==0) return res.status(500).send({ mensaje: "No existen productos" });      
        return res.status(500).send({mensaje:"PRODUCTOS MÁS VENDIDOS", catalaogo: productosVendidos });
    }).sort({  vendido:-1})
}

        
//********************************* EXPORTAR ********************************* */
module.exports ={
    RegistrarProductos,
    ObtenerTodosProductos,
    EditarProductos,
    ObtenerProductoId,
    ObtenerNombreProductos,
    ObtenerCategorias,
    ObtenerNombreCategorias,
    CatalogoProductosMasVendidos
    

}