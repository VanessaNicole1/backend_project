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
            .populate('persona')
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
       
        pagoActualizado.updated_At = new Date().toLocaleString();

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

        pagoEncontrado.updated_At = new Date().toLocaleString();
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