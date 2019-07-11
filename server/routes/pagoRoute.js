/*Server Express*/
let express =  require('express');
/*PERSON MODEL*/
let Persona = require('../models/person');
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
Ingresar una nuevo Pago de una persona 
external_id de la persona
=====================================*/
APP.post('/ingresar/:external_id', (request, response)=>{

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