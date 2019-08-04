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
const PERSONA_PARAMS = 'nombres apellidos cedula telefono external_id';


/******************************************************************************************************
Medico - CITA
*******************************************************************************************************/

/*===================================
Listar citas de determinado médico
external_id del médico por la url
=====================================*/
APP.get('/listarCitas/:external_id', (request, response)=>{

    let external_id = request.params.external_id;

    Medico.findOne({'estado': true, 'external_id' : external_id}, (error, medicoEncontrado) =>{

        if(!medicoEncontrado){
            return helpers.errorMessage(response, 400, 'No existe el médico ingresado');
        }

        Cita.find({'estado': true, 'medico' : medicoEncontrado.id})
            .select(`${CITA_PARAMS} -_id`)
            .populate({
                path : 'paciente',
                select : `${PERSONA_PARAMS} -_id`
            })
            .exec((error, citas)=>{
                if(error){
                    return helpers.errorMessage(response, 500, 'Ha sucedido un error en la consulta', error);
                }
                return helpers.successMessage(response, 200, citas);
            });
    });
});


/*===================================
Listar citas de determinado médico
external_id del médico por la url
=====================================*/
APP.get('/listarCitasDiarias/:external_id', (request, response)=>{

    let external_id = request.params.external_id;

    Medico.findOne({'estado': true, 'external_id' : external_id}, (error, medicoEncontrado) =>{

        if(!medicoEncontrado){
            return helpers.errorMessage(response, 400, 'No existe el médico ingresado');
        }

        let currentDate = new Date();

        let getCurrentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

        let month = getCurrentDate.getMonth() < 10 ? `0${getCurrentDate.getMonth()}` : `${getCurrentDate.getMonth()}`;
        let day = getCurrentDate.getDate() < 10 ? `0${getCurrentDate.getDate()}` : `${getCurrentDate.getDate()}`;

        let finalCurrentDate = `${getCurrentDate.getFullYear()}-${month}-${day}`

        Cita.find({'estado': true, 'medico' : medicoEncontrado.id, 'fecha' : finalCurrentDate})
            .select(`${CITA_PARAMS} -_id`)
            .populate({
                path : 'paciente',
                select : `${PERSONA_PARAMS} -_id`
            })
            .exec((error, citas)=>{
                if(error){
                    return helpers.errorMessage(response, 500, 'Ha sucedido un error en la consulta', error);
                }
                return helpers.successMessage(response, 200, citas);
            
            });
    });
});


/******************************************************************************************************
USUARIO CITA
*******************************************************************************************************/

/*===================================
Ingresar cita para el usuario
por url external_id del usuario
params:
    medico : external_id del medico
    precioConsulta
    fecha formato fecha(2019-06-20) - añó - mes - día - hora - minutos - SEGUNDOS
    hora formato(16:00)
=====================================*/
APP.post('/ingresar/:external_id', (request, response) =>{

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

/*===================================
Listar cita de paciente
external_id del paciente por la URL
=====================================*/
APP.get('/listarCitasPaciente/:external_id', (request, response)=>{

    let external_id = request.params.external_id;

    Usuario.findOne({'estado': true, 'external_id' : external_id}, (error, usuarioEncontrado) =>{

        if(!usuarioEncontrado){
            return helpers.errorMessage(response, 400, 'No existe el usuario ingresado');
        }

        Cita.find({'estado': true, 'paciente' : usuarioEncontrado.id})
            .select(`${CITA_PARAMS} -_id`)
            .populate({
                path : 'medico',
                select : `${PERSONA_PARAMS} -_id`
            })
            .exec((error, citas)=>{
                if(error){
                    return helpers.errorMessage(response, 500, 'Ha sucedido un error en la consulta', error);
                }
                return helpers.successMessage(response, 200, citas);
            });
    });
});


/******************************************************************************************************
Métodos auxiliares
*******************************************************************************************************/

module.exports = APP;