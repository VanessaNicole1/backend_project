/*Server Express*/
let express =  require('express');
/*PERSON MODEL*/
let Usuario = require('../models/usuario');
/*PAGO MODEL*/
let Pago = require('../models/pago');
/*ROL MODEL*/
let Rol = require('../models/rol');
/*UUID*/
const UUID = require('uuid/v1');
/*Underscore*/
let under_score = require('underscore');
/*Bcrypt - para encriptar password*/
const BCRYPT = require('bcrypt');

const APP  = express();

/*===================================
Listar todos la lista de personas
=====================================*/
APP.get('/listar', (request, response)=>{

    Usuario.find({'estado' : true})
            .exec((error, personsList) => {

                if(error){
                    return response.status(500).json({
                        ok : false,
                        mensaje : 'Error al obtener la lista de personas',
                        errores : error
                    });
                }
                response.status(200).json({
                    ok : true,
                    personas : personsList
                });
            });
});

/*===================================
Listar los pagos activos de determinada usuario
external_id deL usuario a consultar
=====================================*/
APP.get('/listarPagos/:external_id', (request, response)=>{

    let external_id = request.params.external_id;

    Usuario.find({'estado' : true, 'external_id' : external_id})
            .populate({
                path :'pagos',
                match : {'estado': true}
            })
            .exec((error, personsList) => {
                if(error){
                    return response.status(500).json({
                        ok : false,
                        mensaje : 'Error al obtener la lista de pagos de la persona',
                        errores : error
                    });
                }
                response.status(200).json({
                    ok : true,
                    personas : personsList
                });
            });
});

/*===================================
Ingresar una nueva persona 
external_id del rol
=====================================*/
APP.post('/ingresar', (request, response)=>{

    Rol.findOne({'nombre' : 'USER_ROLE'}, (error, rolEncontrado) =>{

        if(error){
            return response.status(500).json({
                ok : false,
                mensaje : 'Error en el servidor',
                errores : error
            });
        }
        if(!rolEncontrado){
            return response.status(400).json({
                ok : false,
                mensaje : 'No se ha encontrado el rol',
                errores : error
            });
        }
    
        let usuarioBody = infoBody(request.body);
        usuarioBody.password = BCRYPT.hashSync(usuarioBody.password, 10);
        usuarioBody.external_id = UUID();
        usuarioBody.estado = true;
        usuarioBody.created_At = new Date();
        usuarioBody.updated_At = new Date();
        usuarioBody.rol = rolEncontrado.id;

        let usuario = new Usuario(usuarioBody);  

        usuario.save((error, usuarioGuardado)=>{
            if(error){
                return response.status(400).json({
                    ok : false,
                    mensaje : 'Error al guardar la persona',
                    errores : error
                });
            }

            rolEncontrado.personas.push(usuario);
            rolEncontrado.save((error)=>{
                if(error){
                    return response.status(400).json({
                        ok : false,
                        mensaje : 'Error al agregar la persona a los roles',
                        errores : error
                    });
                }
                response.status(201).json({
                    ok : true,
                    usuarioGuardado
                });
            });
        });
    });
});

/*===================================
Modificar una persona existente.
external_id del usuario
=====================================*/
APP.put('/modificar/:external_id', (request, response) => {

    let external_id = request.params.external_id;

    Usuario.findOne({'external_id' : external_id}, (error, usuarioEncontrado) =>{

        if(error){
            return response.status(500).json({
                ok : false,
                mensaje : 'Error en el servidor',
                errores : error
            });
        }
        if(!usuarioEncontrado){
            return response.status(400).json({
                ok : false,
                mensaje : 'No se ha encontrado la persona',
                errores : error
            });
        }

        let usuarioActualizado = infoBody(request.body);
       
        usuarioActualizado.updated_At = new Date();

        Usuario.findByIdAndUpdate(usuarioEncontrado.id, usuarioActualizado, {new: true,
                                                        runValidators : true}, 
                                                        (error, usuarioModificado) => {
            if(error){
                return response.status(408).json({
                    ok : false,
                    mensaje : 'Error al modificar la persona',
                    errores : error
                });
            }

            response.status(200).json({
                ok : true,
                usuarioModificado
            });
        });
    });
});

/*===================================
Eliminado Lógico
external_id del usuario
=====================================*/
APP.put('/eliminar/:external_id', (request, response) => {

    let external_id = request.params.external_id;

    Usuario.findOne({'external_id' : external_id}, (error, usuarioEncontrado) =>{

        if(error){
            return response.status(500).json({
                ok : false,
                mensaje : 'Error en el servidor',
                errores : error
            });
        }
        if(!usuarioEncontrado){
            return response.status(400).json({
                ok : false,
                mensaje : 'No se ha encontrado la persona',
                errores : error
            });
        }
        
        usuarioEncontrado.updated_At = new Date();
        usuarioEncontrado.estado = false;

        usuarioEncontrado.save((error, usuarioEliminado) => {
            if(error){
               return response.status(408).json({
                    ok : false,
                    mensaje : 'Error al eliminar la persona',
                    errores : error
                });
            }

            response.status(200).json({
                ok : true,
                usuarioEliminado
            });
        });
    });
});




/*===================================
=====================================
Sección de métodos auxiliares
===================================.
=====================================*/
let infoBody = (body) => {
    
    return under_score.pick(body, 
                            [
                            'cedula', 
                            'nombres', 
                            'apellidos',
                            'edad', 
                            'genero', 
                            'telefono', 
                            'direccion', 
                            'correo', 
                            'password',
                            'foto'
                            ]);
}

module.exports = APP;