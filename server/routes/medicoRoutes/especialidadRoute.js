/*===================================
Libraries
=====================================*/
let express =  require('express');
let under_score = require('underscore');
const UUID = require('uuid/v1');
/*===================================
Models
=====================================*/
let Especialidad = require('../../models/medico/especialidad');
/*===================================
Own
=====================================*/
let helpers = require("../../helpers/functions");

const APP  = express();
/*===================================
Obtener toda la lista de las especialidades
del hospital
=====================================*/
APP.get('/listar', (request, response)=>{

    Especialidad.find({'estado' : true})
            .exec((error, especialidades) => {
                if(error){
                    helpers.errorMessage(response, 500, 'Error al obtener la lista de especialidades', error);
                }
                helpers.successMessage(response, 200, especialidades);
            });
});

/*===================================
Ingresar una nueva especialidad
Params:
    -nombre
    -descripción
=====================================*/
APP.post('/ingresar', (request, response)=>{

    let especialidadBody = infoBody(request.body);

    if(under_score.isEmpty(especialidadBody)){
        helpers.errorMessage(response, 400,"Se necesita la información de la especialidad");
    }
    
    especialidadBody.external_id = UUID();
    especialidadBody.created_At = new Date();
    especialidadBody.updated_At = new Date();
    especialidadBody.estado = true;

    let especialidad = new Especialidad(especialidadBody); 

    especialidad.save((error, especialidadGuardada)=>{
        if(error){
            helpers.errorMessage(response, 500, 'Error al crear la especialidad', error);
        }
        helpers.successMessage(response, 201, especialidadGuardada);
    });
});

/*===================================
Modificar una especialidad 
external_id de la especialidad
    -nombre
    -descripción
=====================================*/
APP.put('/modificar/:external_id', (request, response) => {

    let external_id = request.params.external_id;

    Especialidad.findOne({'external_id' : external_id}, (error, especialidadEncontrada) =>{

        if(error){
            helpers.errorMessage(response, 500, 'Error en el servidor', error);
        }
        if(!especialidadEncontrada){
            helpers.errorMessage(response, 400,'No se ha encontrado ninguna especialidad');
        }

        let especialidadActualizada = infoBody(request.body);

        if(under_score.isEmpty(especialidadActualizada)){
            helpers.errorMessage(response, 400,"Se necesita información de la especialidad para modificar");
        }
        
        especialidadEncontrada.nombre = especialidadActualizada.nombre || especialidadEncontrada.nombre;
        especialidadEncontrada.descripcion = especialidadActualizada.descripcion || especialidadEncontrada.descripcion;
        especialidadEncontrada.updated_At = new Date();

        especialidadEncontrada.save((error, especialidadModificada) => {
            if(error){
                helpers.errorMessage(response, 500, 'Error al modificar la especialidad', error);
            }

            helpers.successMessage(response, 200, especialidadModificada);
        });
    });
});

/*===================================
Eliminar logicamente una especialidad
external_id de la especialidad a eliminar. 
no params
=====================================*/
APP.put('/eliminar/:external_id', (request, response) => {

    let external_id = request.params.external_id;

    Especialidad.findOne({'external_id' : external_id, 'estado' : true}, (error, especialidadEncontrada) =>{

        if(error){
            helpers.errorMessage(response, 500, 'Error en el servidor', error);
        }
        if(!especialidadEncontrada){
            helpers.errorMessage(response, 400,'No se ha encontrado la especialidad');
        }

        especialidadEncontrada.updated_At = new Date();
        especialidadEncontrada.estado = false;

        especialidadEncontrada.save((error, especialidadEliminada) => {
            if(error){
                helpers.errorMessage(response, 500, 'Error al eliminar la especialidad', error);
            }
            helpers.successMessage(response, 200, especialidadEliminada);
        });
    });
});

/******************************************************************************************************
                                    Métodos Auxiliares
*******************************************************************************************************/        
let infoBody = (body) => {
    
    return under_score.pick(body, 
                            [
                            'nombre',
                            'descripcion'
                            ]);
}

module.exports = APP;