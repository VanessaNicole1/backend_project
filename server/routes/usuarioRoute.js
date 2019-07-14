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
Listar todos la lista de personas activas
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
Ingresar una nueva persona 
required Params:
cedula, nombres, apellidos, edad, genero
telefono, direccion, correo, password, 
optional Params:
foto
=====================================*/
APP.post('/ingresar', (request, response)=>{    
    
    let usuarioBody = infoBody(request.body);
    
    if(!under_score.isEmpty(usuarioBody)){
        
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
            if(usuarioBody.password){
                usuarioBody.password = BCRYPT.hashSync(usuarioBody.password, 10);
            }
            
            usuarioBody.external_id = UUID();
            usuarioBody.estado = true;


            usuarioBody.created_At = new Date().toLocaleString();
            usuarioBody.updated_At = new Date().toLocaleString();
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
               
                response.status(201).json({
                    ok : true,
                    usuarioGuardado
                });
            });
        });
    }else{
        return response.status(400).json({
            ok : false,
            mensaje : 'Ingrese los parámetros necesarios de la persona'
        });
    }
    
});

/*===================================
Modificar una persona existente.
external_id del usuario
optional Params:
nombres, apellidos, edad, genero, telefono
dirección, password, foto
=====================================*/
APP.put('/modificar/:external_id', (request, response) => {
    
    let external_id = request.params.external_id;
    
    Usuario.findOne({'external_id' : external_id, 'estado' : true }, (error, usuarioEncontrado) =>{
        
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

        let usuarioBody = request.body;
        
        if(!under_score.isEmpty(usuarioBody)){
            
            usuarioEncontrado.nombres = usuarioBody.nombres || usuarioEncontrado.nombres;
            usuarioEncontrado.apellidos = usuarioBody.apellidos || usuarioEncontrado.apellidos;
            usuarioEncontrado.edad = usuarioBody.edad || usuarioEncontrado.edad;
            usuarioEncontrado.genero = usuarioBody.genero || usuarioEncontrado.genero;
            usuarioEncontrado.telefono = usuarioBody.telefono || usuarioEncontrado.telefono;
            usuarioEncontrado.direccion = usuarioBody.direccion || usuarioEncontrado.direccion;
            if(usuarioBody.password){
                usuarioEncontrado.password = BCRYPT.hashSync(usuarioBody.password, 10);
            }
            usuarioEncontrado.foto = usuarioBody.foto || usuarioEncontrado.foto;
            usuarioEncontrado.updated_At = new Date().toLocaleString();
            
            usuarioEncontrado.save((error, usuarioModificado) => {
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
        }else{
            return response.status(400).json({
                ok : false,
                mensaje : 'No hay nada que modificar',
                errores : error
            });
        }
    });
    
});

/*===================================
Eliminado Lógico de una persona
external_id del usuario
=====================================*/
APP.put('/eliminar/:external_id', (request, response) => {

    let external_id = request.params.external_id;

    Usuario.findOne({'external_id' : external_id, 'estado' : true}, (error, usuarioEncontrado) =>{
        
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
        
        usuarioEncontrado.updated_At = new Date().toLocaleString();
        usuarioEncontrado.estado = false;
        
        usuarioEncontrado.save((error, usuarioEliminado) => {
            if(error){
                return response.status(408).json({
                    ok : false,
                    mensaje : 'Error al eliminar la persona',
                    errores : error
                });
            }
            /*===================================
            Dar de baja lógicamente los pagos de la persona eliminada
            =====================================*/
            usuarioEncontrado.pagos.forEach(pagoFalse => {

                let pagoActualizado = {
                    estado: false
                }
                Pago.findByIdAndUpdate(pagoFalse, pagoActualizado, (error, pagoModificado) => {});
            });
            response.status(200).json({
                ok : true,
                usuarioEliminado
            });



        });
    });
});

/******************************************************************************************************
                                    USUARIO - PAGOS
*******************************************************************************************************/

/*===================================
Listar los pagos activos de determinada usuario activa
external_id del usuario a consultar
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
Ingresar un nuevo Pago de una persona 
external_id de la persona
Params:
    -cantidad 
    -tipo
=====================================*/
APP.post('/ingresar/:external_id', (request, response)=>{

    let external_id = request.params.external_id;

    Usuario.findOne({'external_id' : external_id, "estado" : true }, (error, personaEncontrada) =>{

        if(error){
            return response.status(500).json({
                ok : false,
                mensaje : 'Error en el servidor',
                errores : error
            });
        }
        if(!personaEncontrada){
            return response.status(400).json({
                ok : false,
                mensaje : 'No se ha encontrado la persona',
                errores : error
            });
        }
    
        let pagoBody = {
            cantidad : request.body.cantidad,
            tipo : request.body.tipo
        }

        if(!under_score.isEmpty(pagoBody)){
            
            pagoBody.external_id = UUID();
            pagoBody.estado = true;
            pagoBody.created_At = new Date().toLocaleString();
            pagoBody.updated_At = new Date().toLocaleString();
            pagoBody.persona = personaEncontrada.id;
    
            let pago = new Pago(pagoBody);  
    
            pago.save((error, pagoGuardado)=>{
                if(error){
                    return response.status(400).json({
                        ok : false,
                        mensaje : 'Error al guardar el pago',
                        errores : error
                    });
                }
    
                personaEncontrada.pagos.push(pago);
                personaEncontrada.save((error)=>{
                    if(error){
                        return response.status(400).json({
                            ok : false,
                            mensaje : 'Error al agregar el pago a la persona'
                        });
                    }
                    response.status(201).json({
                        ok : true,
                        pagoGuardado
                    });
                });
            });
        }else{
            return response.status(400).json({
                ok : false,
                mensaje : 'Se necesita la información del pago a guardar'
            });
        }
    });
});

/******************************************************************************************************
                                    Métodos Auxiliares
*******************************************************************************************************/    
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