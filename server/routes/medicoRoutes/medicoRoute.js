/*===================================
Libraries
=====================================*/
const BCRYPT = require('bcrypt');
let express =  require('express');
let under_score = require('underscore');
const UUID = require('uuid/v1');
/*===================================
Models
=====================================*/
let Especialidad = require('../../models/medico/especialidad');
let Medico = require('../../models/medico/medico');
let Rol = require('../../models/rol');
/*===================================
Own
=====================================*/
let helpers = require("../../helpers/functions");

const APP  = express();

/*===================================
Listar todos los médicos activos
=====================================*/
APP.get('/listar', (request, response)=>{

    Medico.find({'estado' : true})
            .exec((error, medicos) => {

                if(error){
                    helpers.errorMessage(response, 500, 'Error al obtener la lista de médicos', error);
                }
                helpers.successMessage(response, 200, medicos);
            });
});

/*===================================
Listar el médico con sus especialidades
external_id del médico a consultar
=====================================*/
APP.get('/listarMedico/:external_id', (request, response)=>{

    let external_id = request.params.external_id;

    Medico.find({'estado' : true, 'external_id' : external_id})
            .populate({
                path :'especialidades',
                match : {'estado': true}
            })
            .exec((error, medico) => {

                if(error){
                    helpers.errorMessage(response, 500, 'Error al obtener el médico con sus especialidades', error);
                }
                helpers.successMessage(response, 200, medico);
            });
});

/*===================================
Ingresar un nuevo médico 
required Params:
    cedula, nombres, apellidos, edad, genero
    telefono, direccion, correo, password, 
    numeroRegistro, citasDiarias, sueldo
optional Params:
    foto
=====================================*/
APP.post('/ingresar', (request, response)=>{
    
    let medicoBody = infoBody(request.body);

    if(!under_score.isEmpty(medicoBody)){

        Rol.findOne({'nombre' : "MED_ROLE"}, (error, rolEncontrado) =>{
    
            if(error){
                helpers.errorMessage(response, 500, 'Error en el servidor', error);
            }
            if(!rolEncontrado){
                helpers.errorMessage(response, 400,'No se ha encontrado el rol para el médico');
            }
        
            if(medicoBody.password){
                medicoBody.password = BCRYPT.hashSync(medicoBody.password, 10);
            }
            medicoBody.external_id = UUID();
            medicoBody.estado = true;
            medicoBody.created_At = new Date();
            medicoBody.updated_At = new Date();
            medicoBody.rol = rolEncontrado.id;
            
            let medico = new Medico(medicoBody);  
            
            let especialidades = request.body.especialidades;    
            if(especialidades){
                
                especialidades = [...new Set(especialidades)];
                /*===================================
                Encontrar todas las especialidades solicitadas
                Y agregarlas al médico actual
                =====================================*/
                especialidades.forEach(especialidadId => {
                    Especialidad.findOne({'external_id': especialidadId}, (error, especialidadEncontrada) =>{
                        if(error){
                            helpers.errorMessage(response, 500, 'Error en el servidor', error);
                        }
                        if(!especialidadEncontrada){
                            helpers.errorMessage(response, 400, 'No se ha encontrado la especialidad solicitada');
                        }
                        medico.especialidades.push(especialidadEncontrada);
                    });
                });
            }
    
            medico.save((error, medicoGuardado)=>{
                if(error){
                    helpers.errorMessage(response, 500, 'Error al guardar el médico', error);
                }
                helpers.successMessage(response, 201, medicoGuardado);
            }); 
        });

    }else{
        helpers.errorMessage(response, 400,'No hay información para ingresar');
    }
});

/*===================================
Modificar un  médico existente.
external_id del médico a modificar.
campos a modificar:
    nombres, apellidos, edad, género
    teléfono, dirección, password, 
    fotos, citas, diarias, sueldo, foto.
=====================================*/
APP.put('/modificar/:external_id', (request, response) => {

    let external_id = request.params.external_id;

    Medico.findOne({'external_id' : external_id, 'estado' : true}, (error, medicoEncontrado) =>{

        if(error){
            helpers.errorMessage(response, 500, 'Error en el servidor', error);
        }
        if(!medicoEncontrado){
            helpers.errorMessage(response, 400,'No se ha encontrado el médico');
        }
        let medicoBody = request.body;

        if(!under_score.isEmpty(medicoBody)){
            
            medicoEncontrado.nombres = medicoBody.nombres || medicoEncontrado.nombres;
            medicoEncontrado.apellidos = medicoBody.apellidos || medicoEncontrado.apellidos;
            medicoEncontrado.edad = medicoBody.edad || medicoEncontrado.edad;
            medicoEncontrado,genero = medicoBody.genero || medicoEncontrado.genero;
            medicoEncontrado.telefono = medicoBody.telefono || medicoEncontrado.telefono;
            medicoEncontrado.direccion = medicoBody.direccion || medicoEncontrado.direccion;
            if(medicoBody.password){
                medicoEncontrado.password = BCRYPT.hashSync(medicoBody.password, 10);
            }
            medicoEncontrado.foto = medicoBody.foto || medicoEncontrado.foto;
            medicoEncontrado.citasDiarias = medicoBody.citasDiarias || medicoEncontrado.citasDiarias;
            medicoEncontrado.sueldo = medicoBody.sueldo || medicoEncontrado.sueldo;
            medicoEncontrado.updated_At = new Date();
    
            medicoEncontrado.save((error, medicoGuardado)=>{
                if(error){
                    helpers.errorMessage(response, 500, 'Error al guardar el médico', error);
                }
                helpers.successMessage(response, 200, medicoGuardado);
            }); 
        }else{
            helpers.errorMessage(response, 400,'Envie la información para modificar');
        }
    });
});

/*===================================
Eliminado Lógico
external_id del médico a eliminar
no params
=====================================*/
APP.put('/eliminar/:external_id', (request, response) => {

    let external_id = request.params.external_id;

    Medico.findOne({'external_id' : external_id, 'estado': true}, (error, medicoEncontrado) =>{

        if(error){
            helpers.errorMessage(response, 500, 'Error en el servidor', error);
        }
        if(!medicoEncontrado){
            helpers.errorMessage(response, 400,'No se ha encontrado el médico');
        }
        
        medicoEncontrado.updated_At = new Date();
        medicoEncontrado.estado = false;

        medicoEncontrado.save((error, medicoEliminado) => {
            if(error){
                helpers.errorMessage(response, 500, 'Error al eliminar el médico', error);
            }

            helpers.successMessage(response, 200, medicoEliminado);
        });
    });
});

/******************************************************************************************************
                                  ESPECIALIDAD -- MÉDCOS
*******************************************************************************************************/

/*===================================
Agregar especialidad al médico
external_id del médico a agregar especialidad
params:
    especialidad : external_id de la especialidad
=====================================*/
APP.put('/agregarEspecialidad/:external_id', (request, response) => {

    let external_id = request.params.external_id;

    let especialidadNueva = request.body.especialidad;

    if(especialidadNueva){

        Medico.findOne({'external_id' : external_id, 'estado' : true}, (error, medicoEncontrado) =>{
    
            if(error){
                helpers.errorMessage(response, 500, 'Error en el servidor', error);
            }
            if(!medicoEncontrado){
                helpers.errorMessage(response, 400,'No se ha encontrado el médico');
            }
            Especialidad.findOne({'external_id': especialidadNueva}, (error, especialidadEncontrada) =>{
                
                if(!especialidadEncontrada){
                    helpers.errorMessage(response, 400,'No se ha encontrado la especialidad');
                }
                if( !medicoEncontrado.especialidades.includes(especialidadEncontrada.id)){
                    
                    medicoEncontrado.especialidades.push(especialidadEncontrada);
                    medicoEncontrado.save((error, medicoGuardado)=>{
                       
                        if(error){
                            helpers.errorMessage(response, 500,'Error al guardar el médico', error);
                        }
                        helpers.successMessage(response, 200, medicoGuardado);
                    }); 
                    
                }else{
                    helpers.errorMessage(response, 400, 'El médico ya cuenta con esa especialidad');
                }
            });
        });
    }else{
        helpers.errorMessage(response, 400,'Se requiere una especialidad para agregar');
    }
});

/*===================================
Eliminar especialidad al médico
external_id del médico a eliminar especialidad
params: 
    especialidad : external_id de la especialidad
=====================================*/
APP.put('/eliminarEspecialidad/:external_id', (request, response) => {

    let especialidadToDelete = request.body.especialidad; 

    if(!especialidadToDelete){
        helpers.errorMessage(response, 400,'Se requiere una especialidad para eliminar');
    }

    let external_id = request.params.external_id;

    Medico.findOne({'estado' : true, 'external_id' : external_id})
            .populate({
                path :'especialidades',
                match : {'estado': true}
            })
            .exec((error, medico) => {
                if(error){
                    helpers.errorMessage(response, 500, 'Error al obtener el médico con sus especialidades', error);
                }

                if(!medico.especialidades || medico.especialidades.length === 0){
                    helpers.errorMessage(response, 400,'El médico aún no tiene especialidad asignada.');
                }

                let existeEspecialidad = false;

                medico.especialidades.forEach(especialidad => {
                    if(especialidad.external_id === especialidadToDelete){
                        existeEspecialidad = true;
                    }
                });

                if(!existeEspecialidad){
                    helpers.errorMessage(response, 400,'El médico no tiene asignada esa especialidad.');
                }
                let especialidadesActualizadas = medico.especialidades
                                                .filter(especialidad =>  especialidad.external_id !== especialidadToDelete);

                medico.especialidades = [];

                especialidadesActualizadas.forEach(especialidad =>{
                    medico.especialidades.push(especialidad);
                });

                medico.save((error, medicoGuardado)=>{
                    if(error){
                        helpers.errorMessage(response, 500, 'Error al guardar el médico', error);
                    }
                    helpers.successMessage(response, 200, medicoGuardado);
                }); 
            });
});


/******************************************************************************************************
                                  MÉTODDOS AUXILIARES
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
                            'foto',
                            'numeroRegistro',
                            'citasDiarias',
                            'sueldo'
                            ]);
}

module.exports = APP;