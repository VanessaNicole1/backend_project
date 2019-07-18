/*===================================
Libraries
=====================================*/
let express =  require('express');
let under_score = require('underscore');
/*===================================
Models
=====================================*/
let Pago = require('../models/pago');
/*===================================
Own
=====================================*/
let helpers = require("../helpers/functions");


const APP  = express();

/*===================================
Obtener todos la lista de todos 
los pagos activos
=====================================*/
APP.get('/listar', (request, response)=>{

    Pago.find({'estado' : true})
            .populate('persona')
            .exec((error, pagos) => {

                if(error){
                    helpers.errorMessage(response, 500, 'Error al obtener la lista de pagos', error);
                }
                helpers.successMessage(response, 200, pagos);
            });
});

/*====================================
Listar pagos dependiendo del tipo que envien     
params:
    tipo : string                            
======================================*/
APP.get('/listarPagosTipo', (request, response) => {


    let tipo = request.body.tipo;

    Pago.find({ 'estado': true, 'tipo': tipo })
        .populate('persona')
        .exec((error, pagos) => {

            if (error) {
                helpers.errorMessage(response, 500, 'Error al extraer lista de pagos de un tipo en especial', error);
            }
            helpers.successMessage(response, 200, pagos);
        });
});

/******************************************************************************************************
POR VERIFICAR MÉTODOS
*******************************************************************************************************/

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
            helpers.errorMessage(response, 500, 'Error en el servidor', error);
        }
        if(!pagoEncontrado){
            helpers.errorMessage(response, 400,'No se ha encontrado el pago de la persona');
        }

        let pagoActualizado = infoBody(request.body);
       
        pagoActualizado.updated_At = new Date();

        Pago.findByIdAndUpdate(pagoEncontrado.id, pagoActualizado, {new: true,
                                                        runValidators : true}, 
                                                        (error, pagoModificado) => {
            if(error){
                helpers.errorMessage(response, 500, 'Error al modificar el pago de la persona', error);
            }
            helpers.successMessage(response, 200, pagoModificado);
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
            helpers.errorMessage(response, 500, 'Error en el servidor', error);
        }
        if(!pagoEncontrado){
            helpers.errorMessage(response, 400,'No se ha encontrado el pago de la persona');
        }

        pagoEncontrado.updated_At = new Date();
        pagoEncontrado.estado = false;

        pagoEncontrado.save((error, pagoEliminado) => {
            if(error){
                helpers.errorMessage(response, 500, 'Error al eliminar el pago de la persona', error);
            }
            helpers.successMessage(response, 200, pagoEliminado);
        });
    });
});

/******************************************************************************************************
                                                Métodos Auxiliares
*******************************************************************************************************/    
let infoBody = (body) => {
    
    return under_score.pick(body, 
                            [
                            'cantidad',
                            'tipo'
                            ]);
}

module.exports = APP;