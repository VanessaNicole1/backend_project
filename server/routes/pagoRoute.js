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
let  { verifyAdmin, verifyToken} = require('../middlewares/authentication');

/*===================================
Obtener todos la lista de todos 
los pagos activos
=====================================*/
APP.get('/listar', [verifyToken, verifyAdmin], (request, response)=>{

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
APP.get('/listarPagosTipo', [verifyToken, verifyAdmin], (request, response) => {


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


module.exports = APP;