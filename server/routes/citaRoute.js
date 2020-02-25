/*===================================
Libraries
=====================================*/
let express =  require('express');
let under_score = require('underscore');
const UUID = require('uuid/v1');
/*===================================
Models
=====================================*/
let Cita = require('../models/cita');
let Medico = require('../models/medico/medico');
let Usuario = require('../models/usuario');
/*===================================
Own
=====================================*/
let helpers = require("../helpers/functions");

/*===================================
Variables
=====================================*/
const APP  = express();
const CITA_PARAMS = 'fecha precioConsulta paciente hora external_id';
const PERSONA_PARAMS = 'nombres apellidos cedula telefono correo direccion external_id';
let  {  verifyToken, verifyUser, verifyMed, verifyAdminOrUser, verifyAdminOrMed, verifyAdminOrAllUser } = require('../middlewares/authentication');

/******************************************************************************************************
Medico - CITA
*******************************************************************************************************/

/*===================================
Listar citas de determinado médico
external_id del médico por la url
=====================================*/
APP.get('/listarCitas/:external_id', [verifyToken, verifyAdminOrMed] , (request, response)=>{

    let external_id = request.params.external_id;

    let desde = request.query.desde || 0;
    desde = Number(desde);

    Medico.findOne({'estado': true, 'external_id' : external_id}, (error, medicoEncontrado) =>{

        if(!medicoEncontrado){
            return helpers.errorMessage(response, 400, 'No existe el médico ingresado');
        }

        Cita.find({'estado': true, 'medico' : medicoEncontrado.id})
        .skip(desde)
        .limit(5)
        .select(`${CITA_PARAMS} -_id`)
        .populate({
            path : 'paciente',
            select : `${PERSONA_PARAMS} -_id`
        })
        .exec((error, citas)=>{
            if(error){
                return helpers.errorMessage(response, 500, 'Ha sucedido un error en la consulta', error);
            }

            
            Cita.count({'estado' : true, 'medico' : medicoEncontrado.id}, (error, conteo)=>{
                finalSend = {
                    conteo,
                    citas
                }
                return helpers.successMessage(response, 200, finalSend);
            });
        });
    });
});

/**
 * Listar Citas realizadas de determinado médico
 * external_id del médico por la url
 */
APP.get('/listarCitasRealizadas/:external_id', [verifyToken] , (request, response)=>{

    let external_id = request.params.external_id;

    let desde = request.query.desde || 0;
    desde = Number(desde);

    Medico.findOne({'estado': true, 'external_id' : external_id}, (error, medicoEncontrado) =>{

        if(!medicoEncontrado){
            return helpers.errorMessage(response, 400, 'No existe el médico ingresado');
        }

        Cita.find({'estado': true, 'medico' : medicoEncontrado.id, 'realizada' : true})
        .skip(desde)
        .limit(5)
        .select(`${CITA_PARAMS} -_id`)
        .populate({
            path : 'paciente',
            select : `${PERSONA_PARAMS} -_id`
        })
        .populate({
            path : 'consulta'
        })
        .exec((error, citas)=>{
            if(error){
                return helpers.errorMessage(response, 500, 'Ha sucedido un error en la consulta', error);
            }

            
            Cita.count({'estado' : true, 'medico' : medicoEncontrado.id, 'realizada' : true}, (error, conteo)=>{
                finalSend = {
                    conteo,
                    citas
                }
                return helpers.successMessage(response, 200, finalSend);
            });
        });
    });
});


/*===================================
Listar citas diarias de determinado médico
external_id del médico por la url
=====================================*/
APP.get('/listarCitasDiariasMed/:external_id', [verifyToken, verifyAdminOrMed] , (request, response)=>{

    let external_id = request.params.external_id;
    let desde = request.query.desde || 0;
    desde = Number(desde);

    Medico.findOne({'estado': true, 'external_id' : external_id}, (error, medicoEncontrado) =>{

        if(!medicoEncontrado){
            return helpers.errorMessage(response, 400, 'No existe el médico ingresado');
        }

        Cita.find({'estado': true, 'medico' : medicoEncontrado.id, 'fecha' : getCurrentDate(), 'realizada' : false})
            .skip(desde)
            .limit(5)
            .select(`${CITA_PARAMS} -_id`)
            .populate({
                path : 'paciente',
                select : `${PERSONA_PARAMS} -_id`
            })
            .exec((error, citas)=>{
                if(error){
                    return helpers.errorMessage(response, 500, 'Ha sucedido un error en la consulta', error);
                }
                Cita.count({'estado' : true, 'medico' : medicoEncontrado.id, 'fecha' : getCurrentDate(), 'realizada' : false}, (error, conteo)=>{
                    finalSend = {
                        conteo,
                        citas
                    }
                    return helpers.successMessage(response, 200, finalSend);
                });
            });
    });
});

/*===================================
Modificar el estado de iuna cita 
external_id de la cita
    -nombre
=====================================*/
APP.put('/realizarCita/:external_id', [verifyToken],(request, response) => {

    let external_id = request.params.external_id;
    
    Cita.findOne({'estado':true, 'external_id' : external_id }, (error, citaEncontrada) =>{

        if(error){
            return helpers.errorMessage(response, 500, 'Error en el servidor', error);
        }
        if(!citaEncontrada){
            return helpers.errorMessage(response, 400,'No se ha encontrado ninguna cita');
        }
        
        citaEncontrada.realizada = true;
        citaEncontrada.asistencia = true;

        citaEncontrada.save((error, citaRealizada) => {
            if(error){
                return helpers.errorMessage(response, 500, 'Error al modificar la cita', error);
            }
            return helpers.successMessage(response, 200, citaRealizada);
        });
    });
});

/*===================================
Modificar el estado de iuna cita 
external_id de la cita
    -nombre
=====================================*/
APP.put('/asistencia/:external_id', [verifyToken],(request, response) => {

    let external_id = request.params.external_id;
    
    Cita.findOne({'estado':true, 'external_id' : external_id }, (error, citaEncontrada) =>{

        if(error){
            return helpers.errorMessage(response, 500, 'Error en el servidor', error);
        }
        if(!citaEncontrada){
            return helpers.errorMessage(response, 400,'No se ha encontrado ninguna cita');
        }
        
        citaEncontrada.realizada = true;
        citaEncontrada.asistencia = false;

        citaEncontrada.save((error, citaRealizada) => {
            if(error){
                return helpers.errorMessage(response, 500, 'Error al modificar la cita', error);
            }
            return helpers.successMessage(response, 200, citaRealizada);
        });
    });
});


/*===================================
Listar las horas diarias disponible del médico
external_medico por la url.
=====================================*/

APP.post('/horasDisponibles/:external_id', [verifyToken, verifyAdminOrAllUser], (request, response) =>{

    let external_id = request.params.external_id;

    Medico.findOne({'estado': true, 'external_id' : external_id}, (error, medicoEncontrado) =>{

        if(!medicoEncontrado){
            return helpers.errorMessage(response, 400, 'No existe el médico ingresado');
        }
        // let horasActuales = ["10:00", "11:00", "12:00", "15:00", "16:00", "17:00", "18:00"];
        let horasActuales = ["10:00", "11:00", "12:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
        let fecha = request.body.fecha; //formato "2019-12-21" 


        Cita.find({'estado': true, 'medico' : medicoEncontrado.id, 'fecha' : fecha})
            .select(`${CITA_PARAMS} -_id`)
            .exec((error, citas)=>{
                if(error){
                    return helpers.errorMessage(response, 500, 'Ha sucedido un error en la consulta', error);
                }

                let horasOcupadas = [];

                /* Extraigo todas las horas Ocupadas del médico*/
                citas.forEach(cita =>{
                    horasOcupadas.push(cita.hora);
                });

                // return helpers.successMessage(response, 200, horasOcupadas);

                let horasDisponibles = [];

                horasActuales.forEach( horaActual =>{
                    if(!horasOcupadas.includes(horaActual)){
                        horasDisponibles.push(horaActual);
                    }
                });
                return helpers.successMessage(response, 200, horasDisponibles);
            });
    });
});



/******************************************************************************************************
USUARIO CITA
*******************************************************************************************************/
/**
 * Listar Citas realizadas de determinado médico
 * external_id del médico por la url
 */
APP.get('/listarCitasRealizadasUser/:external_id', [verifyToken] , (request, response)=>{

    let external_id = request.params.external_id;

    let desde = request.query.desde || 0;
    desde = Number(desde);

    Usuario.findOne({'estado': true, 'external_id' : external_id}, (error, usuarioEncontrado) =>{

        if(!usuarioEncontrado){
            return helpers.errorMessage(response, 400, 'No existe el médico ingresado');
        }

        Cita.find({'estado': true, 'paciente' : usuarioEncontrado.id, 'realizada' : true})
        .skip(desde)
        .limit(5)
        .select(`${CITA_PARAMS} -_id`)
        .populate({
            path : 'medico',
            select : `${PERSONA_PARAMS} -_id`
        })
        .populate({
            path : 'consulta'
        })
        .exec((error, citas)=>{
            if(error){
                return helpers.errorMessage(response, 500, 'Ha sucedido un error en la consulta', error);
            }

            
            Cita.count({'estado' : true, 'paciente' : usuarioEncontrado.id, 'realizada' : true}, (error, conteo)=>{
                finalSend = {
                    conteo,
                    citas
                }
                return helpers.successMessage(response, 200, finalSend);
            });
        });
    });
});


/*===================================
Listar todas las citas de un paciente
external_id del paciente por la URL
=====================================*/
APP.get('/listarCitasPaciente/:external_id', [verifyToken, verifyAdminOrUser] , (request, response)=>{

    let external_id = request.params.external_id;
    let desde = request.query.desde || 0;
    desde = Number(desde);

    Usuario.findOne({'estado': true, 'external_id' : external_id}, (error, usuarioEncontrado) =>{

        if(!usuarioEncontrado){
            return helpers.errorMessage(response, 400, 'No existe el usuario ingresado');
        }

        Cita.find({'estado': true, 'paciente' : usuarioEncontrado.id})
            .skip(desde)
            .limit(5)
            .select(`${CITA_PARAMS} -_id`)
            .populate({
                path : 'medico',
                select : `${PERSONA_PARAMS} -_id`
            })
            .exec((error, citas)=>{
                if(error){
                    return helpers.errorMessage(response, 500, 'Ha sucedido un error en la consulta', error);
                }

                
                Cita.count({'estado' : true, 'paciente' : usuarioEncontrado.id}, (error, conteo)=>{
                    finalSend = {
                        conteo,
                        citas
                    }
                    return helpers.successMessage(response, 200, finalSend);
                });
            });
    });
});

/*====================================
Listar citas diarias del paciente
Se requiere el external_id del paciente                                 
======================================*/
APP.get('/listarCitasDiariasPaciente/:external_id', [verifyToken, verifyAdminOrUser], (request, response) => {

    let external_id = request.params.external_id;

    let desde = request.query.desde || 0;
    desde = Number(desde);

    Usuario.findOne({ 'estado': true, 'external_id': external_id }, (error, usuarioEncontrado) => {

        if (error) {
            return helpers.errorMessage(response, 500, 'Ocurrió un error al extraer la persona');
        }

        if (!usuarioEncontrado) {
            return helpers.errorMessage(response, 400, 'No existe usuario');
        }


        Cita.find({'estado': true, 'paciente' : usuarioEncontrado.id, 'fecha' : getCurrentDate(), realizada : false})
            .skip(desde)
            .limit(5)
            .select(`${CITA_PARAMS} -_id`)
            .populate({
                path : 'medico',
                select : `${PERSONA_PARAMS} -_id`
            })
            .exec((error, citas)=>{
                if(error){
                    return helpers.errorMessage(response, 500, 'Ha sucedido un error en la consulta', error);
                }
                Cita.count({'estado' : true, 'paciente' : usuarioEncontrado.id, 'fecha' : getCurrentDate(), realizada : false}, (error, conteo)=>{
                    finalSend = {
                        conteo,
                        citas
                    }
                    return helpers.successMessage(response, 200, finalSend);
                });
            });
    })
});


/*===================================
Ingresar cita para el usuario
por url external_id del usuario
params:
    medico : external_id del medico
    precioConsulta
    fecha formato fecha(2019-06-20) 
    hora formato(16:00)
=====================================*/
APP.post('/ingresar/:external_id', [verifyToken, verifyUser] ,(request, response) =>{

    let body = request.body;

    if(under_score.isEmpty(body)){
        return helpers.errorMessage(response, 400, 'Se necesita la información completa de la Cita');
    }

    let external_usuario = request.params.external_id;

    Usuario.findOne({'estado' : true, 'external_id' : external_usuario}, (error, usuarioEncontrado)=>{
        if(error){
            return helpers.errorMessage(response, 500, 'Ocurrió un error al extraer la persona', error);
        }
        if(!usuarioEncontrado){
            return helpers.errorMessage(response, 400, 'No se ha encontrado la persona');
        }
        Medico.findOne({'estado' : true, 'external_id' : body.medico}, (error, medicoEncontrado)=>{
            if(!medicoEncontrado){
                return helpers.errorMessage(response, 400, 'No se ha encontrado el médico de la cita');
            }
            let citaBody =  {
                external_id : UUID(),
                paciente : usuarioEncontrado.id,
                medico : medicoEncontrado.id,
                fecha : body.fecha,
                hora : body.hora,
                precioConsulta : body.precioConsulta,
                estado : true,
                realizada : false,
                realizada : false,
                created_At : helpers.transformarHora(new Date()),
                updated_At : helpers.transformarHora(new Date())
            }

            let cita = new Cita(citaBody);

            cita.save((error, citaGuardada) =>{
                if(error){
                    return helpers.errorMessage(response, 500, 'Ocurrió un error al guardar la cita', error);
                }

                usuarioEncontrado.citas.push(citaGuardada);
                usuarioEncontrado.save();

                medicoEncontrado.citas.push(citaGuardada);
                medicoEncontrado.save();

                helpers.successMessage(response, 201, citaGuardada);
            });
        });
    });
});


/******************************************************************************************************
Métodos auxiliares
*******************************************************************************************************/

/*===================================
Obtener fecha en formato
2019-08-06
=====================================*/
let getCurrentDate = ()=>{

    let currentDate = new Date();

    let month = currentDate.getMonth() < 10 ? `0${currentDate.getMonth() +1}` : `${currentDate.getMonth() +1}`;
    
    let day = currentDate.getDate() < 10 ? `0${currentDate.getDate()}` : `${currentDate.getDate()}`;

    let finalCurrentDate = `${currentDate.getFullYear()}-${month}-${day}`

    return finalCurrentDate;
}


module.exports = APP;