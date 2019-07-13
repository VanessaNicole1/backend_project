/*Server Express*/
let express =  require('express');
/*PERSON MODEL*/
let Medico = require('../../models/medico/medico');
/*ROL MODEL*/
let Especialidad = require('../../models/medico/especialidad');
/*PAGO MODEL*/
let Rol = require('../../models/rol');
/*UUID*/
const UUID = require('uuid/v1');
/*Underscore*/
let under_score = require('underscore');
/*Bcrypt - para encriptar password*/
const BCRYPT = require('bcrypt');

const APP  = express();

/*===================================
Listar todos los médicos
=====================================*/
APP.get('/listar', (request, response)=>{

    Medico.find({'estado' : true})
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
Listar el médico con su especialidad
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
                    return response.status(500).json({
                        ok : false,
                        mensaje : 'Error al obtener el médico con sus especialidades',
                        errores : error
                    });
                }
                response.status(200).json({
                    ok : true,
                     medico
                });
            });
});


/*===================================
Ingresar un nuevo médico 
=====================================*/
APP.post('/ingresar', (request, response)=>{

    Rol.findOne({'nombre' : "MED_ROLE"}, (error, rolEncontrado) =>{

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
                mensaje : 'No se ha encontrado el rol para el médico',
                errores : error
            });
        }
        
        let medicoBody = infoBody(request.body);
        medicoBody.password = BCRYPT.hashSync(medicoBody.password, 10);
        medicoBody.external_id = UUID();
        medicoBody.estado = true;
        medicoBody.created_At = new Date();
        medicoBody.updated_At = new Date();
        medicoBody.rol = rolEncontrado.id;
        
        let medico = new Medico(medicoBody);  
        /*===================================
        Encontrar todas las especialidades solicitadas
        Y agregarlas al médico actual
        =====================================*/
        let especialidades = request.body.especialidades;    
        if(especialidades){
             especialidades = [...new Set(especialidades)];
        }

        if(especialidades){
            especialidades.forEach(especialidadId => {
                Especialidad.findOne({'external_id': especialidadId}, (error, especialidadEncontrada) =>{
                    if(error){
                        return response.status(500).json({
                            ok : false,
                            mensaje : 'Error en el servidor',
                            errores : error
                        });
                    }
                    if(!especialidadEncontrada){
                        return response.status(400).json({
                            ok : false,
                            mensaje : 'No se ha encontrado la especialidad solicitada',
                            errores : error
                        });
                    }
                    medico.especialidades.push(especialidadEncontrada);
                });
            });
        }

        medico.save((error, medicoGuardado)=>{
            if(error){
                return response.status(400).json({
                    ok : false,
                    mensaje : 'Error al guardar el médico',
                    errores : error
                });
            }

            response.status(201).json({
                ok : true,
                medicoGuardado
            });
        }); 
    });
});

/*===================================
Modificar una persona existente.
external_id del médico a modificar.
campos a modificar:
    nombres, apellidos, edad, género
    teléfono, dirección, password, 
    fotos, citas, diarias, sueldo.
=====================================*/
APP.put('/modificar/:external_id', (request, response) => {

    let external_id = request.params.external_id;

    Medico.findOne({'external_id' : external_id, 'estado' : true}, (error, medicoEncontrado) =>{

        if(error){
            return response.status(500).json({
                ok : false,
                mensaje : 'Error en el servidor',
                errores : error
            });
        }
        if(!medicoEncontrado){
            return response.status(400).json({
                ok : false,
                mensaje : 'No se ha encontrado el médico',
                errores : error
            });
        }
        let medicoBody = request.body;

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
                return response.status(400).json({
                    ok : false,
                    mensaje : 'Error al guardar el médico',
                    errores : error
                });
            }

            response.status(201).json({
                ok : true,
                medicoGuardado
            });
        }); 
    });
});


/*===================================
Agregar especialidad al médico
external_id del médico a agregar especialidad
params:
    Arreglo de external_id de las especialidades
    a agregar
=====================================*/
APP.put('/agregarEspecialidad/:external_id', (request, response) => {

    let external_id = request.params.external_id;

    Medico.findOne({'external_id' : external_id, 'estado' : true}, (error, medicoEncontrado) =>{

        if(error){
            return response.status(500).json({
                ok : false,
                mensaje : 'Error en el servidor',
                errores : error
            });
        }
        if(!medicoEncontrado){
            return response.status(400).json({
                ok : false,
                mensaje : 'No se ha encontrado el médico',
                errores : error
            });
        }
        let especialidades = request.body.especialidades; 

        if(especialidades){
            especialidades = [...new Set(especialidades)];
        }

        if(especialidades){
            especialidades.forEach(especialidadId => {
                Especialidad.findOne({'external_id': especialidadId}, (error, especialidadEncontrada) =>{
                    if(error){
                        return response.status(500).json({
                            ok : false,
                            mensaje : 'Error en el servidor',
                            errores : error
                        });
                    }
                    if(!especialidadEncontrada){
                        return response.status(400).json({
                            ok : false,
                            mensaje : 'No se ha encontrado la especialidad solicitada',
                            errores : error
                        });
                    }
                   if( !medicoEncontrado.especialidades.includes(especialidadEncontrada.id)){
                        medicoEncontrado.especialidades.push(especialidadEncontrada);
                    }
                });
            });
            medicoEncontrado.save((error, medicoGuardado)=>{
                if(error){
                    return response.status(400).json({
                        ok : false,
                        mensaje : 'Error al guardar el médico',
                        errores : error
                    });
                }
    
                response.status(201).json({
                    ok : true,
                    medicoGuardado
                });
            }); 
        }else{
            return response.status(402).json({
                ok : false,
                mensaje : 'Se requiere una especialidad para agregar'
            });
        }

    });
});


/*===================================
Eliminar especialidad al médico
external_id del médico a eliminar especialidad
=====================================*/
APP.put('/eliminarEspecialidad/:external_id', (request, response) => {

    let especialidadToDelete = request.body.especialidad; 

    if(!especialidadToDelete){
        return response.status(402).json({
            ok : false,
            mensaje : 'Se requiere una especialidad para eliminar'
        });
    }

    let external_id = request.params.external_id;

    Medico.findOne({'estado' : true, 'external_id' : external_id})
            .populate({
                path :'especialidades',
                match : {'estado': true}
            })
            .exec((error, medico) => {
                if(error){
                    return response.status(500).json({
                        ok : false,
                        mensaje : 'Error al obtener el médico con sus especialidades',
                        errores : error
                    });
                }

                if(!medico.especialidades || medico.especialidades.length === 0){
                    return response.status(402).json({
                        ok:false,
                        mensaje : 'El médico aún no tiene especialidad asignada.'
                    });
                }

                let especialidadesActualizadas = medico.especialidades
                                                .filter(especialidad =>  especialidad.external_id !== especialidadToDelete);

                medico.especialidades = [];

                especialidadesActualizadas.forEach(especialidad =>{
                    medico.especialidades.push(especialidad);
                });
                

                medico.save((error, medicoGuardado)=>{
                    if(error){
                        return response.status(400).json({
                            ok : false,
                            mensaje : 'Error al guardar el médico',
                            errores : error
                        });
                    }

                    response.status(201).json({
                        ok : true,
                        medicoGuardado
                    });
                }); 
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
            return response.status(500).json({
                ok : false,
                mensaje : 'Error en el servidor',
                errores : error
            });
        }
        if(!medicoEncontrado){
            return response.status(400).json({
                ok : false,
                mensaje : 'No se ha encontrado el médico',
                errores : error
            });
        }
        
        medicoEncontrado.updated_At = new Date();
        medicoEncontrado.estado = false;

        medicoEncontrado.save((error, medicoEliminado) => {
            if(error){
               return response.status(408).json({
                    ok : false,
                    mensaje : 'Error al eliminar el médico',
                    errores : error
                });
            }

            response.status(200).json({
                ok : true,
                medicoEliminado
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