//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const Categorias = require('../models/categorias.model');
const Productos = require('../models/productos.model');

//El administrador Puede agregar una nueva categoría en la base de datos.
/* | | | | | | | | | | | | | | | | | | | | | CATEGORIAS CRUD - OPCIONES DE ADMINISTRADOR| | | | | | | | | | | | | | | | | | | | |*/
//*************************** 1. REGISTRAR CATEGORIAS *************************** */
function RegistrarCategorias(req, res) {

    if ( req.user.rol == "ROL_CLIENTE" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a registar Categorias. Únicamente el Administrador puede hacerlo'});

    var parametros = req.body;
    var empresasModel = new Categorias();

    if(parametros.nombreCategoria && parametros.descripcionCategoria) {
            empresasModel.nombreCategoria = parametros.nombreCategoria;
            empresasModel.descripcionCategoria = parametros.descripcionCategoria;
            empresasModel.idUsuario = req.user.sub;

            Categorias.find({ nombreCategoria : parametros.nombreCategoria }, (err, categoriaEncontrada) => {
                if ( categoriaEncontrada.length == 0 ) {
                        empresasModel.save((err, categoriaGuardada) => {
                            if (err) return res.status(500)
                                .send({ mensaje: 'Error en la peticion' });
                            if(!categoriaGuardada) return res.status(500)
                                .send({ mensaje: 'Error al agregar la categoria'});
                            
                            return res.status(200).send({ categoria: categoriaGuardada });
                        });
                } else {
                    return res.status(500)
                        .send({ mensaje: 'Este nombre de categoría, ya  se encuentra utilizado. Según la política de la empresa, no es posible repetir nombres de categoría.' });
                }
            })
    }else{
        return res.status(500)
        .send({ mensaje: 'Debe llenar los campos necesarios'});
    }
}

//  Poder visualizarla todas las categorías ingresadas.
//********************************* 2 BUSCAR CATEGORIAS DEL ADMINISTRADOR ********************************* */
function ObtenerCategoriasAdministrador(req, res) {

    if ( req.user.rol == "ROL_CLIENTE" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a buscar Categorias. Únicamente el Administrador puede hacerlo'});

    Categorias.find({idUsuario:req.user.sub}, (err, categoriasEncontradas) => {
        if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if(!categoriasEncontradas) return res.status(500).send({ mensaje: "Error al obtener las categorias."});
        return res.status(200).send({ categoria: categoriasEncontradas })
    })//.populate('idUsuario',"")
}
//PRUEBA DE POPULATE
/*async function ObtenerCategoriasAdministrador (req,res){
    try{
        const categorias = await Categorias.find({idUsuario:req.user.sub}).populate("idUsuario").lean();
        return res.status(200).send({categorias:categorias})

    }catch(e){
        return e
    }

}*/




//Editar una categoría y eliminarla.
//**************************** 3. EDITAR CATEGORIAS ******************************* */
function EditarCategorias(req, res) {
    var idCat = req.params.idCategoria;
    var parametros = req.body;

    if ( req.user.rol == "ROL_CLIENTE" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a editar Categorias. Únicamente el Administrador puede hacerlo'});

    Categorias.findOne({_id:idCat}, (err,buscarCategoria)=>{
        if(!buscarCategoria||err)return res.status(404).send( { mensaje: 'La categoria no existe, verifique el ID'});

        if(parametros.nombreCategoria==""|| parametros.descripcionCategoria=="") return res.status(500)
        .send({ mensaje: 'Los campos no pueden ser vacíos'});
    
        if(parametros.idUsuario|| parametros.idUsuario==""){
            return res.status(500)
            .send({ mensaje: 'Solamente se pueden editar los campos de nombre y descripción'});
    
        }else{
        if(!buscarCategoria||err)return res.status(404).send( { mensaje: 'La categoria no existe, verifique el ID'});
            if(buscarCategoria.idUsuario !=req.user.sub) return res.status(500).send({mensaje:"No se pueden editar otras categorias que no pertenecen al usuario Logueado"})
            Categorias.find({ nombreCategoria : parametros.nombreCategoria }, (err, categoriaEncontrada) => {
                if ( categoriaEncontrada.length == 0 ) {
                    parametros.idUsuario = req.user.sub
                    Categorias.findByIdAndUpdate({_id:idCat}, parametros, { new: true } ,(err, categoriaActualizada) => {
                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion'});
                        if(!categoriaActualizada) return res.status(404).send( { mensaje: 'Error al editar la categoria'});
                
                        return res.status(200).send({ categoria: categoriaActualizada});
                    });
                } else {
                    return res.status(500)
                        .send({ mensaje: 'Este nombre de categoría, ya  se encuentra utilizado. Según la política de la empresa, no es posible repetir nombres de categoría.' });
                }
            })
        }
    })
}

//Si algún producto pertenece a una categoría y es necesario eliminar dicha categoría, 
//el producto debe pasar automáticamente a una categoría por defecto.
//********************************* 4. ELIMINAR CATEGORIAS ********************************* */
function EliminarCategorias(req, res){
    const idCat = req.params.idCategoria;

    if ( req.user.rol == "ROL_CLIENTE" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a eliminar Categorias. Únicamente el Administrador puede hacerlo'});

    Categorias.find({_id:idCat},(err,categoriaExistente)=>{
        if(err) return res.status(404).send({mensaje:'Error, la categoria no existe. Verifique el ID'})
        if(categoriaExistente.length==0) return res.status(500).send({mensaje:"La categoria no existe"})

        Categorias.findOne({nombreCategoria:"CATEGORÍA - POR DEFECTO"},(err,categoriaEncontrada)=>{
            if(err) return res.status(400).send({mensaje:'Error en la peticion de buscar categoria por defecto'})
            if(!categoriaEncontrada){
               const modeloCategorias = new Categorias()
               modeloCategorias.nombreCategoria = "CATEGORÍA - POR DEFECTO"
               modeloCategorias.descripcionCategoria = "Categorías por defecto"
               modeloCategorias.idUsuario = null;

                modeloCategorias.save((err,categoriaGuardada)=>{
                   if(err) return res.status(400).send({mensaje:'Error en la peticion de guardar la categoria por defecto'})
                   if(!categoriaGuardada) return res.status(400).send({mensaje:'No se ha podido agregar la categoria'})

                  Productos.updateMany({idCategoria:idCat},{idCategoria:categoriaGuardada.id},(err,categoriasActualizadas)=>{
                    if(err) return res.status(400).send({mensaje:'Error en la peticion de actualizar '})

                    Categorias.findByIdAndDelete(idCat,(err,categoriaEliminada)=>{
                        if(err) return res.status(400).send({mensaje:'Error en la peticion al eliminar '})
                        if(!categoriaEliminada) return res.status(400).send({mensaje:'No se ha podido eliminar el categoria'})
                        return res.status(200).send({editado:categoriasActualizadas,categoria:categoriaEliminada})

                    })


                })
               })

            }else{
            Productos.updateMany({idCategoria:idCat},{idCategoria:categoriaEncontrada._id},(err,categoriaEncontrada)=>{
                if(err) return res.status(400).send({mensaje:'Error en la peticion de actualizar '})
                Categorias.findByIdAndDelete(idCat,(err,categoriaEliminada)=>{
                    if(err) return res.status(400).send({mensaje:'Error en la peticion al eliminar '})
                    if(!categoriaEliminada) return res.status(400).send({mensaje:'No se ha podido eliminar el curso'})
                    return res.status(200).send({curso:categoriaEliminada})
                })
            })

         }      

        })
    })

}

        
//********************************* EXPORTAR ********************************* */
module.exports ={
    RegistrarCategorias,
    ObtenerCategoriasAdministrador,
    EditarCategorias,
    EliminarCategorias
    

}