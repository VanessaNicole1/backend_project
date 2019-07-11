/*Server Express*/
let express =  require('express');
/*PERSON MODEL*/
let Persona = require('../models/person');
/*PAGO MODEL*/
let Pago = require('../models/pago');
/*ROL MODEL*/
let Rol = require('../models/rol');
/*UUID*/
const UUID = require('uuid/v1');
/*Underscore*/
let under_score = require('underscore');

const APP  = express();

/*===================================
Listar todos la lista de personas
=====================================*/
APP.get('/listar', (request, response)=>{

    Persona.find({'estado' : true})
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
Listar los pagos activos de determinada persona
external_id de la persona a consultar
=====================================*/
APP.get('/listarPagos/:external_id', (request, response)=>{

    let external_id = request.params.external_id;

    Persona.find({'estado' : true, 'external_id' : external_id})
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
APP.post('/ingresar/:external_id', (request, response)=>{

    let external_id = request.params.external_id;

    Rol.findOne({'external_id' : external_id}, (error, rolEncontrado) =>{

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
    
        let personaBody = infoBody(request.body);
        personaBody.external_id = UUID();
        personaBody.estado = true;
        personaBody.created_At = new Date();
        personaBody.updated_At = new Date();
        personaBody.rol = rolEncontrado.id;

        let persona = new Persona(personaBody);  

        persona.save((error, personaGuardada)=>{
            if(error){
                return response.status(400).json({
                    ok : false,
                    mensaje : 'Error al guardar la persona',
                    errores : error
                });
            }

            rolEncontrado.personas.push(persona);
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
                    personaGuardada
                });
            });
        });
    


    });
});

/*===================================
Modificar una persona existente.
=====================================*/
APP.put('/modificar/:external_id', (request, response) => {

    let external_id = request.params.external_id;

    Persona.findOne({'external_id' : external_id}, (error, personaEncontrada) =>{

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

        let personaActualizada = infoBody(request.body);
       
        personaActualizada.updated_At = new Date();

        Persona.findByIdAndUpdate(personaEncontrada.id, personaActualizada, {new: true,
                                                        runValidators : true}, 
                                                        (error, personaModificada) => {
            if(error){
                return response.status(408).json({
                    ok : false,
                    mensaje : 'Error al modificar la persona',
                    errores : error
                });
            }

            response.status(200).json({
                ok : true,
                personaModificada
            });
        });
    });
});

/*===================================
Eliminado Lógico
=====================================*/
APP.put('/eliminar/:external_id', (request, response) => {

    let external_id = request.params.external_id;

    Persona.findOne({'external_id' : external_id}, (error, personaEncontrada) =>{

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
        
        personaEncontrada.updated_At = new Date();
        personaEncontrada.estado = false;

        personaEncontrada.save((error, personaEliminada) => {
            if(error){
               return response.status(408).json({
                    ok : false,
                    mensaje : 'Error al eliminar la persona',
                    errores : error
                });
            }

            response.status(200).json({
                ok : true,
                personaEliminada
            });
        });
    });
});
/*===================================
Ingresar pago para persona.
=====================================*/
APP.put('/ingresarPago/:external_id', (request, response)=>{

    let external_id = request.params.external_id;

    Persona.findOne({'external_id' : external_id}, (error, personaEncontrada) =>{

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
        
        let pagoBody = under_score.pick(body, [
                                                'tipo',
                                                'cantidad'
                                                ]);
        let created_At = new Date();
        
        let pago = new Pago({
            external_id : UUID(),
            estado : true, 
            tipo : pagoBody.tipo,
            cantidad : pagoBody.cantidad,
            persona : personaEncontrada.id,
            created_At,
            updated_At : created_At
        });

        pago.save((error, pagoGuardado)=>{
            if(error){
                return response.status(408).json({
                        ok : false,
                        mensaje : 'Error al guardar el pago',
                        errores : error
                    });
                }
                response.status(200).json({
                    ok : true,
                    pagoGuardado
                });
        })
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