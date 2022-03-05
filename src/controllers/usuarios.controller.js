//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const Usuarios = require('../models/usuarios.model');
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

 if(!parametros.email&&!parametros.password) return res.status(500)
 .send({ mensaje: 'Debe llenar los campos necesario'});

    Usuarios.findOne({ email : parametros.email }, (err, usuarioEncontrado)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if(usuarioEncontrado){
            bcrypt.compare(parametros.password, usuarioEncontrado.password, 
                (err, verificacionPassword)=>{//TRUE OR FALSE
                    if ( verificacionPassword ) {
                        if(parametros.obtenerToken === 'true'){
                            return res.status(200)
                                .send({ token: jwt.crearToken(usuarioEncontrado) })
                        } else {
                            usuarioEncontrado.password = undefined;
                            return  res.status(200)
                                .send({ usuario: usuarioEncontrado })
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
            usuarioModel.rol = 'ROL_CLIENTES';
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
                            
                            return res.status(200).send({ usuario: usuarioGuardado });
                        });
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

//• Puede modificar a que rol pertenecer ese usuario (Administrador o Cliente).
//• Editar los datos de un usuario solamente si es un usuario de rol cliente.
//**************************** 2. EDITAR USUARIOS ******************************* */
function EditarPerfilUsuario(req, res) {
    var idUser = req.params.idEmpresa;
    var parametros = req.body;

    Usuarios.findOne(idUser,(err,usuarioBuscado)=>{
        if(err) return res.status(500).send({mensaje: "Error, el usuario no existe"});
        if(!usuarioEliminado) return res.status(404).send({mensaje: "Error, el usuario no existe"})

        if(usuarioBuscado.rol=="ROL_ADMINISTRADOR"){
            return res.status(500).send({ mensaje: 'No pueden editar administradores'});
        }else{
            if(parametros.email || parametros.password|| parametros.email==""
            || parametros.password==""){
                return res.status(500)
                .send({ mensaje: 'No puede modificar los campos necesarios para el logueo,solamente nombre, apellido y rol'});
        
            }else{
                if(parametros.rol == "ROL_ADMINISTRADOR"){
                    Empresas.findByIdAndUpdate(idUser, parametros, { new: true } ,(err, usuarioActualizado) => {
                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion'});
                        if(!usuarioActualizado) return res.status(404).send( { mensaje: 'Error al editar la empresa'});
                
                        return res.status(200).send({ empresa: usuarioActualizado});
                    });
                }else{
                    return res.status(500)
                .send({ mensaje: 'El rol ingresado no es válido (Ingrese ROL_ADMINISTRADOR)'});
                }
            }
        }
    })
}

//• Eliminar el usuario si su rol es de cliente.
//********************************* ELIMINAR USUARIOS ********************************* */
 //ELIMINAR USUARIOS
 function EliminarUsuarios(req, res){
     var idUser = req.params.idCliente

     if(req.user.rol=="ROL_CLIENTE"){
        if(idUser == req.user.sub){
            Usuarios.findByIdAndDelete(req.user.sub,(err,usuarioEliminado)=>{
                if(err) return res.status(500).send({mensaje: "Error, el usuario no existe"});
                if(!usuarioEliminado) return res.status(404).send({mensaje: "Error, el usuario no existe"})
        
                return  res.status(200).send({usuario:usuarioEliminado});
            })
        }else{
            return res.status(500).send({ mensaje: 'No puede eliminar otros clientes'});
        }
     }else{
        Usuarios.findOne(idUser,(err,usuarioBuscado)=>{
            if(err) return res.status(500).send({mensaje: "Error, el usuario no existen"});
            if(!usuarioEliminado) return res.status(404).send({mensaje: "Error, el usuario no existen"})
            if(usuarioBuscado.rol=="ROL_ADMINISTRADOR"){
                return res.status(500).send({ mensaje: 'No pueden eliminar administradores'});
            }else{
                Usuarios.findByIdAndDelete(idUser,(err,usuarioEliminado)=>{
                    if(err) return res.status(500).send({mensaje: "Error, el usuario no existen"});
                    if(!usuarioEliminado) return res.status(404).send({mensaje: "Error, el usuario no existen"})
            
                    return  res.status(200).send({usuario:usuarioEliminado});
                })
            }
        })

     }
}

//********************************* EXPORTAR ********************************* */
module.exports ={
    Login,
    RegistrarClientes,
    EditarPerfilUsuario,
    EliminarUsuarios
}