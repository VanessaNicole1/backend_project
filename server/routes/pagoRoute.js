/*Server Express*/
let express =  require('express');
/*PERSON MODEL*/
let Usuario = require('../models/usuario');
/*PAGO MODEL*/
let Pago = require('../models/pago');
/*UUID*/
const UUID = require('uuid/v1');
/*Underscore*/
let under_score = require('underscore');

const APP  = express();

/*===================================
Obtener todos la lista de todos 
los pagos activos
=====================================*/
APP.get('/listar', (request, response)=>{

    Pago.find({'estado' : true})
            .exec((error, pagosList) => {

                if(error){
                    return response.status(500).json({
                        ok : false,
                        mensaje : 'Error al obtener la lista de pagos',
                        errores : error
                    });
                }
                response.status(200).json({
                    ok : true,
                    pagos : pagosList
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
    
        let pagoBody = infoBody(request.body);
 
        pagoBody.external_id = UUID();
        pagoBody.estado = true;
        pagoBody.created_At = new Date();
        pagoBody.updated_At = new Date();
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
                        mensaje : 'Error al agregar el pago a la persona',
                        errores : error
                    });
                }
                response.status(201).json({
                    ok : true,
                    pagoGuardado
                });
            });
        });
    });
});

/*===================================
Modificar un pago de determinada persona.
external_id del pago a modificar. 
Params posibles a modificar:
    -cantidad 
    -tipo
=====================================*/
APP.put('/modificar/:external_id', (request, response) => {

    let external_id = request.params.external_id;

    Pago.findOne({'external_id' : external_id}, (error, pagoEncontrado) =>{

        if(error){
            return response.status(500).json({
                ok : false,
                mensaje : 'Error en el servidor',
                errores : error
            });
        }
        if(!pagoEncontrado){
            return response.status(400).json({
                ok : false,
                mensaje : 'No se ha encontrado el pago de la persona',
                errores : error
            });
        }

        let pagoActualizado = infoBody(request.body);
       
        pagoActualizado.updated_At = new Date();

        Pago.findByIdAndUpdate(pagoEncontrado.id, pagoActualizado, {new: true,
                                                        runValidators : true}, 
                                                        (error, pagoModificado) => {
            if(error){
                return response.status(408).json({
                    ok : false,
                    mensaje : 'Error al modificar el pago de la persona',
                    errores : error
                });
            }

            response.status(200).json({
                ok : true,
                pagoModificado
            });
        });
    });
});

/*===================================
Eliminar un pago de determinada persona.
external_id del pago a eliminar. 
no params
=====================================*/
APP.put('/eliminar/:external_id', (request, response) => {

    let external_id = request.params.external_id;

    Pago.findOne({'external_id' : external_id}, (error, pagoEncontrado) =>{

        if(error){
            return response.status(500).json({
                ok : false,
                mensaje : 'Error en el servidor',
                errores : error
            });
        }
        if(!pagoEncontrado){
            return response.status(400).json({
                ok : false,
                mensaje : 'No se ha encontrado el pago de la persona',
                errores : error
            });
        }

        pagoEncontrado.updated_At = new Date();
        pagoEncontrado.estado = false;

        pagoEncontrado.save((error, pagoEliminado) => {
            if(error){
                return response.status(408).json({
                    ok : false,
                    mensaje : 'Error al eliminar el pago de la persona',
                    errores : error
                });
            }

            response.status(200).json({
                ok : true,
                pagoEliminado
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
                            'cantidad',
                            'tipo'
                            ]);
}

module.exports = APP;