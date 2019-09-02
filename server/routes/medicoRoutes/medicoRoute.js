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

/*===================================
Variables
=====================================*/
const APP  = express();
const ESPECIALIDAD_PARAMS = 'nombre descripcion precioConsulta external_id';
const MED_PARAMS = 'nombres apellidos foto especialidades external_id';
let  {  verifyToken, verifyAdminOrMed, verifyAdmin, verifyAdminOrAllUser} = require('../../middlewares/authentication');

/******************************************************************************************************
Inicio de métodos
*******************************************************************************************************/

/*===================================
Listar todos los médicos activos
=====================================*/
APP.get('/listar', [verifyToken, verifyAdmin], (request, response)=>{

    let desde = request.query.desde || 0;
    desde = Number(desde);

    Medico.find({'estado' : true})
            .skip(desde)
            .limit(5)
            .select('-_id')
            .exec((error, medicos) => {

                if(error){
                    return helpers.errorMessage(response, 500, 'Error al obtener la lista de médicos', error);
                }

                Medico.count({'estado' : true}, (error, conteo)=>{
                    finalSend = {
                        conteo,
                        medicos
                    }
                    return helpers.successMessage(response, 200, finalSend);
                });
            });
});

/*===================================
Listar el médico con sus especialidades
external_id del médico a consultar
=====================================*/
APP.get('/listarMedico/:external_id',  [verifyToken, verifyAdminOrMed],(request, response)=>{

    let external_id = request.params.external_id;

    Medico.findOne({'estado' : true, 'external_id' : external_id})
            .populate({
                path :'especialidades',
                select : `${ESPECIALIDAD_PARAMS} -_id`,
                match : {'estado': true}
            })
            .exec((error, medico) => {

                if(error){
                    return helpers.errorMessage(response, 500, 'Error al obtener el médico con sus especialidades', error);
                }
                return helpers.successMessage(response, 200, medico);
            });
});

/*====================================
Lista de medicos con la información necesaria que necesita saber el paciente 
external_id del médico                                
======================================*/
APP.get('/listarMed/:external_id', [verifyToken, verifyAdminOrAllUser], (request, response) => {

    let external_id = request.params.external_id;

    Medico.findOne({ 'estado': true, 'external_id': external_id })
        .select(MED_PARAMS)
        .populate({
            path: 'especialidades',
            select: `${ESPECIALIDAD_PARAMS} -_id`,
            match: { 'estado': true }
        })
        .exec((error, medicoEncontrado) => {
            if (error) {

                return helpers.errorMessage(response, 500, 'Error al extraer el historial del usuario');

            }

            if (!medicoEncontrado) {
                return helpers.errorMessage(response, 500, 'No se encontró el médico');
            }

            return helpers.successMessage(response, 200, medicoEncontrado);
        });
});


/*===================================
Ingresar un nuevo médico 
required Params:
    cedula, nombres, apellidos, edad, genero
    telefono, direccion, password, 
    numeroRegistro, citasDiarias, sueldo
optional Params:
    foto, [especialidades] : [external_id_especialida1 , external_id_especialidad2]
=====================================*/
APP.post('/ingresar',[verifyToken, verifyAdmin] ,(request, response)=>{
    
    let medicoBody = infoBody(request.body);

    if(under_score.isEmpty(medicoBody)){
        helpers.errorMessage(response, 400,'No hay información para ingresar');
    }

    Rol.findOne({'nombre' : "MED_ROLE"}, (error, rolEncontrado) =>{

        if(error){
            return helpers.errorMessage(response, 500, 'Error en el servidor', error);
        }
        if(!rolEncontrado){
            return helpers.errorMessage(response, 400,'No se ha encontrado el rol para el médico');
        }
    
        if(medicoBody.password){
            medicoBody.password = BCRYPT.hashSync(medicoBody.password, 10);
        }

        medicoBody.correo = helpers.getCorreo(medicoBody.nombres, medicoBody.apellidos, medicoBody.cedula);
        medicoBody.external_id = UUID();
        medicoBody.estado = true;
        medicoBody.created_At = helpers.transformarHora(new Date());
        medicoBody.updated_At = helpers.transformarHora(new Date());
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
                Especialidad.findOne({'external_id': especialidadId, 'estado' : true}, ESPECIALIDAD_PARAMS , (error, especialidadEncontrada) =>{
                    if(error){
                            return helpers.errorMessage(response, 500, 'Error en el servidor', error);
                    }
                    if(!especialidadEncontrada){
                        return helpers.errorMessage(response, 400, 'No se ha encontrado la especialidad solicitada');
                    }
                    medico.especialidades.push(especialidadEncontrada);
                });
            });
        }

        medico.save((error, medicoGuardado)=>{
            if(error){
                return helpers.errorMessage(response, 500, 'Error al guardar el médico', error);
            }
            return helpers.successMessage(response, 201, medicoGuardado);
        }); 
    });
});

/*===================================
Modificar un  médico existente.
external_id del médico a modificar.
campos a modificar:
    nombres, apellidos, edad, género
    teléfono, dirección, password, citas, diarias, sueldo, foto.
=====================================*/
APP.put('/modificar/:external_id', [verifyToken, verifyAdmin] ,(request, response) => {

    let external_id = request.params.external_id;

    let medicoBody = request.body;

    if(under_score.isEmpty(medicoBody)){
       return helpers.errorMessage(response, 400,'No existe información para modificar el médico indicado');
    }
    Medico.findOne({'external_id' : external_id, 'estado' : true}, (error, medicoEncontrado) =>{

        if(error){
            return helpers.errorMessage(response, 500, 'Error en el servidor', error);
        }
        if(!medicoEncontrado){
            return helpers.errorMessage(response, 400,'No se ha encontrado el médico');
        }
            
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
        medicoEncontrado.updated_At =helpers.transformarHora(new Date());

        medicoEncontrado.save((error, medicoGuardado)=>{
            if(error){
                return helpers.errorMessage(response, 500, 'Error al guardar el médico', error);
            }
            return helpers.successMessage(response, 200, medicoGuardado);
        }); 
    });
});

/*===================================
Eliminado Lógico
external_id del médico a eliminar
no params
=====================================*/
APP.put('/eliminar/:external_id', [verifyToken, verifyAdmin], (request, response) => {

    let external_id = request.params.external_id;

    Medico.findOne({'external_id' : external_id, 'estado': true}, (error, medicoEncontrado) =>{

        if(error){
            return helpers.errorMessage(response, 500, 'Error en el servidor', error);
        }
        if(!medicoEncontrado){
            return helpers.errorMessage(response, 400,'No se ha encontrado el médico');
        }
        
        medicoEncontrado.updated_At = helpers.transformarHora(new Date());
        medicoEncontrado.estado = false;

        medicoEncontrado.save((error, medicoEliminado) => {
            if(error){
                return helpers.errorMessage(response, 500, 'Error al eliminar el médico', error);
            }
            return helpers.successMessage(response, 200, medicoEliminado);
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
APP.put('/agregarEspecialidad/:external_id', [verifyToken, verifyAdmin] ,(request, response) => {

    let external_id = request.params.external_id;

    let especialidadNueva = request.body.especialidad;

    if(!especialidadNueva){
        helpers.errorMessage(response, 400,'Se requiere una especialidad para agregar');
    }

    Medico.findOne({'external_id' : external_id, 'estado' : true}, (error, medicoEncontrado) =>{

        if(error){
            return helpers.errorMessage(response, 500, 'Error en el servidor', error);
        }
        if(!medicoEncontrado){
            return helpers.errorMessage(response, 400,'No se ha encontrado el médico');
        }
        Especialidad.findOne({'external_id': especialidadNueva}, (error, especialidadEncontrada) =>{
            
            if(!especialidadEncontrada){
                return helpers.errorMessage(response, 400,'No se ha encontrado la especialidad');
            }
            if( medicoEncontrado.especialidades.includes(especialidadEncontrada.id)){
                return helpers.errorMessage(response, 400, 'El médico ya cuenta con esa especialidad');
            } 
            medicoEncontrado.especialidades.push(especialidadEncontrada);
            medicoEncontrado.save((error, medicoGuardado)=>{
                
                if(error){
                    return helpers.errorMessage(response, 500,'Error al guardar el médico', error);
                }
                return helpers.successMessage(response, 200, medicoGuardado);
            });
        });
    });
    
});

/*===================================
Eliminar especialidad al médico
external_id del médico a eliminar especialidad
params: 
    especialidad : external_id de la especialidad
=====================================*/
APP.put('/eliminarEspecialidad/:external_id', [verifyToken, verifyAdmin] ,(request, response) => {

    let especialidadToDelete = request.body.especialidad; 

    if(!especialidadToDelete){
        return helpers.errorMessage(response, 400,'Se requiere una especialidad para eliminar');
    }

    let external_id = request.params.external_id;

    Medico.findOne({'estado' : true, 'external_id' : external_id})
            .populate({
                path :'especialidades',
                select : `${ESPECIALIDAD_PARAMS}`,
                match : {'estado': true}
            })
            .exec((error, medico) => {
                if(error){
                    return helpers.errorMessage(response, 500, 'Error al obtener el médico con sus especialidades', error);
                }

                if(!medico){
                    return helpers.errorMessage(response, 400,'No se ha encontrado el médico');
                }

                if(!medico.especialidades || medico.especialidades.length === 0){
                    return helpers.errorMessage(response, 400,'El médico aún no tiene especialidad asignada.');
                }

                let existeEspecialidad = false;

                medico.especialidades.forEach(especialidad => {
                    if(especialidad.external_id === especialidadToDelete){
                        existeEspecialidad = true;
                    }
                });

                if(!existeEspecialidad){
                    return helpers.errorMessage(response, 400,'El médico no tiene asignada esa especialidad.');
                }
                let especialidadesActualizadas = medico.especialidades
                                                .filter(especialidad =>  especialidad.external_id !== especialidadToDelete);

                medico.especialidades = [];

                especialidadesActualizadas.forEach(especialidad =>{
                    medico.especialidades.push(especialidad);
                });

                medico.save((error, medicoGuardado)=>{
                    if(error){
                        return helpers.errorMessage(response, 500, 'Error al guardar el médico', error);
                    }
                    return helpers.successMessage(response, 200, medicoGuardado);
                }); 
            });
});

APP.get('/verifyCedula/:cedula', (request, response)=>{

    let cedula = request.params.cedula;

    Medico.findOne({'estado' : true, 'cedula' : cedula}, (error, emailEncontrado) =>{

        if(error){
            return helpers.errorMessage(response, 500, 'Sucedio un error', error);
        }
        if(!emailEncontrado){
            let send = {
                equal : false
            }

            return helpers.successMessage(response, 200, send );
        }else{
            let send = {
                equal : true,
                mensaje : 'La cedula ya existe'
            }
            return helpers.successMessage(response, 200, send );
        }
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
                            'password',
                            'foto',
                            'numeroRegistro',
                            'citasDiarias',
                            'sueldo'
                            ]);
}

module.exports = APP;