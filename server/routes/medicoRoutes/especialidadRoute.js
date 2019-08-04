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
let Medico = require('../../models/medico/medico');
/*===================================
Own
=====================================*/
let helpers = require("../../helpers/functions");

const APP  = express();


/******************************************************************************************************
Inicio de Métodos
*******************************************************************************************************/

/*===================================
Obtener toda la lista de las especialidades
del hospital
=====================================*/
APP.get('/listar', (request, response)=>{
    showEspecialidades(response);
});



/*===================================
Listar especialidad diferentes a la del médico
external_id del médico por la URL
=====================================*/
APP.get('/listarEspecialidades/:external_id', (request, response)=>{
   
    let external_id = request.params.external_id;
 
    Medico.findOne({'estado' : true, 'external_id' : external_id}, (error, medicoEncontrado)=>{

        if(error){
            return helpers.errorMessage(response, 500, 'Error al extraer las especialidades', error);
        }
        if(!medicoEncontrado){
            return helpers.errorMessage(response, 400, 'Ocurrio un error al extraer las distintas especialidades');
        }

        let especialidadesMedico = medicoEncontrado.especialidades;

        if(especialidadesMedico){

            let especialidadResponse = [];

            let respuesta = getEspecialidades();
            respuesta.then(especialidades =>{

                especialidadResponse = [...especialidades];
                especialidadesMedico.forEach(idEspecialidadMedico => {
                        especialidadResponse = especialidadResponse.filter(especialidad => 
                            especialidad._id.toString() !== idEspecialidadMedico.toString());
                });
            
                return helpers.successMessage(response, 200, especialidadResponse);
            
            }).catch(error =>{
                 return helpers.errorMessage(response, 500, 'Ocurrió un error al extraer las especialidades', error);
            });


        }else{
            showEspecialidades(response);
        }
    });
});


/*===================================
Ingresar una nueva especialidad
Params:
    -nombre
    -descripción
    -precioConsulta
=====================================*/
APP.post('/ingresar', (request, response)=>{

    let especialidadBody = infoBody(request.body);

    if(under_score.isEmpty(especialidadBody)){
        return helpers.errorMessage(response, 400,"Se necesita la información de la especialidad");
    }
    
    especialidadBody.external_id = UUID();
    especialidadBody.created_At = helpers.transformarHora(new Date());
    especialidadBody.updated_At = helpers.transformarHora(new Date());
    especialidadBody.estado = true;

    let especialidad = new Especialidad(especialidadBody); 

    especialidad.save((error, especialidadGuardada)=>{
        if(error){
            return helpers.errorMessage(response, 500, 'Error al crear la especialidad', error);
        }
        return helpers.successMessage(response, 201, especialidadGuardada);
    });
});

/*===================================
Modificar una especialidad 
external_id de la especialidad
    -nombre
    -descripción
    -precioConsulta
=====================================*/
APP.put('/modificar/:external_id', (request, response) => {

    let external_id = request.params.external_id;

    Especialidad.findOne({'external_id' : external_id}, (error, especialidadEncontrada) =>{

        if(error){
            return helpers.errorMessage(response, 500, 'Error en el servidor', error);
        }
        if(!especialidadEncontrada){
            return helpers.errorMessage(response, 400,'No se ha encontrado ninguna especialidad');
        }

        let especialidadActualizada = infoBody(request.body);

        if(under_score.isEmpty(especialidadActualizada)){
            return helpers.errorMessage(response, 400,"Se necesita información de la especialidad para modificar");
        }
        
        especialidadEncontrada.nombre = especialidadActualizada.nombre || especialidadEncontrada.nombre;
        especialidadEncontrada.descripcion = especialidadActualizada.descripcion || especialidadEncontrada.descripcion;
        especialidadEncontrada.precioConsulta = especialidadActualizada.precioConsulta || especialidadEncontrada.precioConsulta;
        especialidadEncontrada.updated_At = helpers.transformarHora(new Date());

        especialidadEncontrada.save((error, especialidadModificada) => {
            if(error){
                return helpers.errorMessage(response, 500, 'Error al modificar la especialidad', error);
            }
            return helpers.successMessage(response, 200, especialidadModificada);
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
            return helpers.errorMessage(response, 500, 'Error en el servidor', error);
        }
        if(!especialidadEncontrada){
            return helpers.errorMessage(response, 400,'No se ha encontrado la especialidad');
        }

        especialidadEncontrada.updated_At = helpers.transformarHora(new Date());
        especialidadEncontrada.estado = false;

        especialidadEncontrada.save((error, especialidadEliminada) => {
            if(error){
                return helpers.errorMessage(response, 500, 'Error al eliminar la especialidad', error);
            }
            return helpers.successMessage(response, 200, especialidadEliminada);
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
                            'descripcion',
                            'precioConsulta'
                            ]);
}

let getEspecialidades = () =>{
    return Especialidad.find({'estado' : true}).exec();
}

let showEspecialidades = (response) =>{
    
    let respuesta = getEspecialidades();

    respuesta.then(especialidades =>{
        return helpers.successMessage(response, 200, especialidades);
    }).catch(error =>{
         return helpers.errorMessage(response, 500, 'Ocurrió un error al extraer las especialidades', error);
    });
}

module.exports = APP;