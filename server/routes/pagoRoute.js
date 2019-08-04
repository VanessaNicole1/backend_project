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

/*===================================
Variables
=====================================*/
const APP  = express();
const PERSON_PARAMS = 'nombres apellidos cedula'

/*===================================
Obtener todos la lista de todos 
los pagos activos
=====================================*/
APP.get('/listar', (request, response)=>{

    Pago.find()
        .populate({
            path : 'persona',
            select : `${PERSON_PARAMS} -_id`
        })
        .exec((error, pagos) => {

            if(error){
                return helpers.errorMessage(response, 500, 'Error al obtener la lista de pagos', error);
            }
            return helpers.successMessage(response, 200, pagos);
        });
});

/*====================================
Listar pagos dependiendo del tipo que envien     
params:
    tipo : string                            
======================================*/
APP.get('/listarPagosTipo', (request, response) => {


    let tipo = request.body.tipo;

    if(!tipo){
        return helpers.errorMessage(response, 400, 'Especifique el tipo de Pago', tipo);
    }

    Pago.find({ 'tipo': tipo })
        .select('-_id -persona')
        .exec((error, pagos) => {

            if (error) {
                return helpers.errorMessage(response, 500, 'Error al extraer lista de pagos de un tipo en especial', error);
            }
            return helpers.successMessage(response, 200, pagos);
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
    
    let pagoActualizado = infoBody(request.body);

    if(under_score.isEmpty(pagoActualizado)){
        return helpers.errorMessage(response, 400,'No hay parámetros para modificar el pago');
    }
    
    Pago.findOne({'external_id' : external_id}, (error, pagoEncontrado) =>{

        if(error){
            return helpers.errorMessage(response, 500, 'Error en el servidor', error);
        }
        if(!pagoEncontrado){
            return helpers.errorMessage(response, 400,'No se ha encontrado el pago de la persona');
        }
       
        pagoActualizado.updated_At = helpers.transformarHora(new Date());

        Pago.findByIdAndUpdate(pagoEncontrado.id, pagoActualizado, {new: true,
                                                        runValidators : true}, 
                                                        (error, pagoModificado) => {
            if(error){
                return helpers.errorMessage(response, 500, 'Error al modificar el pago de la persona', error);
            }
            return helpers.successMessage(response, 200, pagoModificado);
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