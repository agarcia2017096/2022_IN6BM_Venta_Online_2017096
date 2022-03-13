//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const Usuarios = require('../models/usuarios.model');
const Facturas = require('../models/facturas.model');

const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');

//1. Al iniciar la aplicación se creará un usuario administrador con lo siguiente:
//a. Usuario: ADMIN
//b. UsuarioContraseña: 123456
//3. El administrador puede logearse 
/* | | | | | | | | | | | | | | | | | | | | | LOGIN DEL PROYECTO | | | | | | | | | | | | | | | | | | | | |*/
//********************************* LOGIN ********************************* */
function Login(req, res) {
    var parametros = req.body;

 if(parametros.email&&parametros.password){
    Usuarios.findOne({ email : parametros.email }, (err, usuarioEncontrado)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if(usuarioEncontrado){
            bcrypt.compare(parametros.password, usuarioEncontrado.password, 
                (err, verificacionPassword)=>{//TRUE OR FALSE
                    if ( verificacionPassword ) {
                        if(parametros.obtenerToken === 'true'){
                            Facturas.find({idUsuario:usuarioEncontrado._id}, (err, facturasEncontradas) => {

                                if(err) return res.status(500).send({ mensaje: "Error en la peticion, no existen facturas del cliente" });
                                //USUARIO LOGUEADO ADMINISTRADOR NO PUEDE TENER FACTURAS NO TETORNA REGISTRO

                                if(usuarioEncontrado.rol == "ROL_ADMINISTRADOR"){
                                    if(!facturasEncontradas||facturasEncontradas.length==0) return res.status(500).send({mensaje:"INICIO DE SESIÓN",token: jwt.crearToken(usuarioEncontrado)});
                                }
                                //NO EXISTEN FACTURAS EN CLIENTE
                                if(!facturasEncontradas||facturasEncontradas.length==0) return res.status(500).send({mensaje:"INICIO DE SESIÓN",token: jwt.crearToken(usuarioEncontrado), registro: "*El usuario no posee facturas.*"});
                                
                                //EXISTEN FACTURAS EN CLIENTES
                                return res.status(200)
                                .send({mensaje:"INICIO DE SESIÓN",token: jwt.crearToken(usuarioEncontrado) , registro:"FACTURAS:", facturas:facturasEncontradas })
                            }).populate('idUsuario',"nombre")

                        } else {
                            Facturas.find({idUsuario:usuarioEncontrado._id}, (err, facturasEncontradas) => {

                                if(err) return res.status(500).send({ mensaje: "Error en la peticion, no existen facturas del cliente" });
                                //USUARIO LOGUEADO ADMINISTRADOR NO PUEDE TENER FACTURAS NO TETORNA REGISTRO

                                if(usuarioEncontrado.rol == "ROL_ADMINISTRADOR"){
                                    if(!facturasEncontradas||facturasEncontradas.length==0) return res.status(500).send({mensaje:"INICIO DE SESIÓN"});
                                }
                                //NO EXISTEN FACTURAS EN CLIENTE
                                if(!facturasEncontradas||facturasEncontradas.length==0) return res.status(500).send({mensaje:"INICIO DE SESIÓN", registro: "*El usuario no posee facturas.*"});
                                
                                //EXISTEN FACTURAS EN CLIENTES
                                return res.status(200)
                                .send({mensaje:"INICIO DE SESIÓN", registro:"FACTURAS:", facturas:facturasEncontradas })
                            }).populate('idUsuario',"nombre")
                        }

                    
                    } else {
                        return res.status(500)
                            .send({ mensaje: 'Las contraseña no es válida'});
                    }
                })

        }else {
            return res.status(500)
                .send({ mensaje: 'Error, el correo no se encuentra registrado. Verifique los datos'})
        }
    })
 }else{
    return res.status(500)
    .send({ mensaje: 'Debe llenar los campos necesarios (email, password, obtenerToken)'});
 } 
}

//• Puede agregar un nuevo usuario.
//********************************* 3. REGISTRAR CLIENTE ********************************* */
function RegistrarClientes(req, res) {
    var parametros = req.body;
    var usuarioModel = new Usuarios();

    if(parametros.nombre && parametros.apellido && 
        parametros.email && parametros.password) {
            usuarioModel.nombre = parametros.nombre;
            usuarioModel.apellido = parametros.apellido;
            usuarioModel.email = parametros.email;
            usuarioModel.rol = 'ROL_CLIENTE';
            usuarioModel.imagen = null;

            Usuarios.find({ email : parametros.email }, (err, alumnoEncontrado) => {
                if ( alumnoEncontrado.length == 0 ) {

                    bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
                        usuarioModel.password = passwordEncriptada;

                        usuarioModel.save((err, usuarioGuardado) => {
                            if (err) return res.status(500)
                                .send({ mensaje: 'Error en la peticion' });
                            if(!usuarioGuardado) return res.status(500)
                                .send({ mensaje: 'Error al agregar el Usuario'});
                            
                            return res.status(200).send({ mensaje:"REGISTRO DE CLIENTE EXITOSO",usuario: usuarioGuardado });
                        });
                    });                    
                } else {
                    return res.status(500)
                        .send({ mensaje: 'Este correo, ya  se encuentra utilizado' });
                }
            })
    }else{
        return res.status(500)
        .send({ mensaje: 'Debe llenar los campos necesarios (nombre, apellido, email, password)'});
    }
}

//• Puede modificar a que rol pertenecer ese usuario (Administrador o Cliente).
//• Editar los datos de un usuario solamente si es un usuario de rol cliente.
//**************************** 2. EDITAR USUARIOS ******************************* */
function EditarPerfilUsuario(req, res) {
    var idUser = req.params.idUsuario;
    var parametros = req.body;

    Usuarios.findOne({_id:idUser},(err,usuarioBuscado)=>{
        if(err) return res.status(500).send({mensaje: "Error, el usuario no existe. Verifique el ID"});
        if(!usuarioBuscado) return res.status(404).send({mensaje: "Error, el usuario no existe. Verifique el ID"})

        if(usuarioBuscado.rol=="ROL_ADMINISTRADOR"){
            return res.status(500).send({ mensaje: 'No es posible editar Administradores'});
        }else{//Acepta solo ID de clientes
            if(req.user.rol=="ROL_ADMINISTRADOR"){//Administrador puede editar Cientes
                if(parametros.email || parametros.password|| parametros.email==""
                || parametros.password==""){
                    return res.status(500)
                    .send({ mensaje: 'No puede modificar los campos necesarios para el logueo,solamente nombre, apellido y rol'});
            
                }else{
                    if(parametros.rol||parametros.rol==''){
                        if(parametros.rol=="ROL_ADMINISTRADOR"){
                            Usuarios.findByIdAndUpdate(idUser, parametros, { new: true } ,(err, usuarioActualizado) => {
                                if (err) return res.status(500).send({ mensaje: 'Error en la peticion'});
                                if(!usuarioActualizado) return res.status(404).send( { mensaje: 'Error al editar cliente'});
                    
                                return res.status(200).send({ empresa: usuarioActualizado});
                            });
                        } else{
                            return res.status(500)
                            .send({ mensaje: 'El rol ingresado no es válido (Ingrese ROL_ADMINISTRADOR)'});
                        }
                    }else{
                        Usuarios.findByIdAndUpdate(idUser, parametros, { new: true } ,(err, usuarioActualizado) => {
                            if (err) return res.status(500).send({ mensaje: 'Error en la peticion'});
                            if(!usuarioActualizado) return res.status(404).send( { mensaje: 'Error al editar la empresa'});
                            return res.status(200).send({ empresa: usuarioActualizado});
                        });
                    }
                }

            }else{//El CLiente solo puede editar perfil
                console.log(usuarioBuscado._id)

                if(usuarioBuscado._id==req.user.sub){
                    console.log(usuarioBuscado._id)
                    if(parametros.email || parametros.password|| parametros.email==""
                    || parametros.password==""||parametros.rol||parametros.rol==""){
                        return res.status(500)
                        .send({ mensaje: 'El cliente no puede modificar los campos necesarios para el logueo, solamente nombre y apellido'});
                    }
                    Usuarios.findByIdAndUpdate(idUser, parametros, { new: true } ,(err, usuarioActualizado) => {
                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion'});
                        if(!usuarioActualizado) return res.status(404).send( { mensaje: 'Error al editar la empresa'});
                        return res.status(200).send({ usuario: usuarioActualizado});
                    });

                }else{
                    return res.status(500)
                    .send({ mensaje: 'No puede editar otros usuarios, solamnete su perfil de Cliente'});
                }
            }
        }
    })
}

//• Eliminar el usuario si su rol es de cliente.
//********************************* ELIMINAR USUARIOS ********************************* */
 //ELIMINAR USUARIOS
 function EliminarUsuarios(req, res){
     var idUser = req.params.idUsuario

     Usuarios.findOne({_id:idUser},(err,usuarioBuscado)=>{
        if(err) return res.status(500).send({mensaje: "Error, el usuario no existe. Verifique el ID"});
        if(!usuarioBuscado) return res.status(404).send({mensaje: "Error, el usuario no existe. Verifique el ID"})

        if(usuarioBuscado.rol=="ROL_ADMINISTRADOR"){
            return res.status(500).send({ mensaje: 'No pueden eliminar administradores'});
        }
        
        if(req.user.rol=="ROL_CLIENTE"){
            //ELIMINAR PROPIA CUENTA
            console.log(idUser)
            console.log(req.user.sub)

            if(idUser == req.user.sub){
                Usuarios.findByIdAndDelete({_id:req.user.sub},(err,usuarioEliminado)=>{
                    if(err) return res.status(500).send({mensaje: "Error, el usuario no existe"});
                    if(!usuarioEliminado) return res.status(404).send({mensaje: "Error, el usuario no existe"})
            
                    return  res.status(200).send({mensaje:"ELIMINACION EXITOSA",usuario:usuarioEliminado});
                })
            }else{
                return res.status(500).send({ mensaje: 'No puede eliminar otros clientes'});
            }
            //ELIMINACION DEL ADMINITRADOR
        }else{
            Usuarios.findByIdAndDelete({_id:idUser},(err,usuarioEliminado)=>{
                if(err) return res.status(500).send({mensaje: "Error, el usuario no existe"});
                if(!usuarioEliminado) return res.status(404).send({mensaje: "Error, el usuario no existe"})
        
                return  res.status(200).send({mensaje:"ELIMINACION EXITOSA",usuario:usuarioEliminado});
            })
        }
     })
}

//*************************** 2. MOSTRAR FACTURA *************************** */
function MostrarFacturas(req, res){

    Facturas.find({idUsuario:req.user.sub}, (err, facturasEncontradas) => {
        if(err) return res.status(500).send({ mensaje: "Error en la peticion, no existen facturas del cliente" });
        if(!facturasEncontradas||facturasEncontradas.length==0) return res.status(500).send({ mensaje: "El cliente no posee facturas."});
        return res.status(200).send({ facturas: facturasEncontradas })
    }).populate('idUsuario',"nombre")
}



//********************************* EXPORTAR ********************************* */
module.exports ={
    Login,
    RegistrarClientes,
    EditarPerfilUsuario,
    EliminarUsuarios
}