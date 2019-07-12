/*Server Express*/
let express =  require('express');
/*PERSON MODEL*/
let Medico = require('../../models/medico/medico');
/*PAGO MODEL*/
let Pago = require('../../models/pago');
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
external_id de la especialidad
=====================================*/
APP.post('/ingresar/:external_id', (request, response)=>{

    let external_id = request.params.external_id;

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

        Especialidad.findOne({'external_id': external_id}, (error, especialidadEncontrada) =>{
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
            let medicoBody = infoBody(request.body);
            medicoBody.password = BCRYPT.hashSync(medicoBody.password, 10);
            medicoBody.external_id = UUID();
            medicoBody.estado = true;
            medicoBody.created_At = new Date();
            medicoBody.updated_At = new Date();
            medicoBody.rol = rolEncontrado.id;
            
            let medico = new Medico(medicoBody);  
            medico.especialidades.push(especialidadEncontrada);
            
            medico.save((error, medicoGuardado)=>{
                if(error){
                    return response.status(400).json({
                        ok : false,
                        mensaje : 'Error al guardar el médico',
                        errores : error
                    });
                }
    
                rolEncontrado.personas.push(medico);
                rolEncontrado.save((error)=>{
                    if(error){
                        return response.status(400).json({
                            ok : false,
                            mensaje : 'Error al asignar un rol al médico actual',
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
    });
});

/*===================================
Modificar una persona existente.
external_id del médico a eliminar
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

        let medicoActualizado = infoBody(request.body);
        medicoActualizado.password = BCRYPT.hashSync(medicoActualizado.password, 10);
       
        medicoActualizado.updated_At = new Date();

        Medico.findByIdAndUpdate(medicoEncontrado.id, medicoActualizado, {new: true,
                                                        runValidators : true}, 
                                                        (error, medicoModificado) => {
            if(error){
                return response.status(408).json({
                    ok : false,
                    mensaje : 'Error al modificar el médico',
                    errores : error
                });
            }

            response.status(200).json({
                ok : true,
                medicoModificado
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