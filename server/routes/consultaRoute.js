/*===================================
Libraries
=====================================*/
let express =  require('express');
let under_score = require('underscore');
const UUID = require('uuid/v1');
/*===================================
Models
=====================================*/
let Cita = require("../models/cita");
let Consulta = require('../models/historiaClinica/consulta');
let Historial = require('../models/historiaClinica/historia');
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
const PERSON_PARAMS = 'nombres apellidos telefono external_id';
const CITA_PARAMS = 'precioConsulta fecha hora external_id';
const CONSULTA_PARAMS = 'diagnostico motivo receta external_id';
let  {  verifyToken, verifyAdminOrUser, verifyAllMed, verifyAdminAnduserOrMed } = require('../middlewares/authentication');

/**********************************************************************************************************
                                     MEDICO   -   CONSULTAS                   
***********************************************************************************************************/

/*====================================
Realizar una consulta nueva.
external_id de la cita que genera la consulta
Params:
   - diagnostico
   - motivo   
   - receta           
======================================*/
APP.post('/ingresar/:external_id', [verifyToken, verifyAllMed], (request, response) => {

    let external_id = request.params.external_id;

    let body = request.body;

    if(under_score.isEmpty(body)){
        return helpers.errorMessage(response, 400, 'Se necesita la información para poder realizar la consulta')
    }

    Cita.findOne({'estado' : true, 'external_id' : external_id}, (error, citaEncontrada) =>{
        if (error) {
            return helpers.errorMessage(response, 500, 'Error en el servidor', error );
        }

        if (!citaEncontrada) {
            return helpers.errorMessage(response, 400, 'No se encontró la cita');
        }

        if(citaEncontrada.consulta){
            return helpers.errorMessage(response, 400, 'La cita ya tiene una consulta');
        }

        Historial.findOne({'estado' : true, 'persona': citaEncontrada.paciente},(error, historialEncontrado)=>{

            if (!historialEncontrado) {
                return helpers.errorMessage(response, 400, 'No se encontró la historia para el paciente');
            }

            let consultaBody = {
                external_id : UUID(),
                diagnostico: body.diagnostico,
                motivo: body.motivo,
                estado : true,
                historia : historialEncontrado.id,
                cita : citaEncontrada.id,
                receta : body.receta,
                created_At : helpers.transformarHora(new Date()),
                updated_At : helpers.transformarHora(new Date())
            }

            let consultaNueva = new Consulta(consultaBody);

            consultaNueva.save((error, consultaGuardada) => {

                if (error) {
                    return helpers.errorMessage(response, 500, 'Error al guardar la consulta', error );
                }
                
                historialEncontrado.consultas.push(consultaGuardada);
                historialEncontrado.save();

                citaEncontrada.consulta = consultaGuardada.id;
                citaEncontrada.save();
                
                return helpers.successMessage(response, 201, consultaGuardada);
            });
        });
    });   
});

/*====================================
Ver todas las consultas de determinado 
paciente realizadas con determinad médico
external_id del médico por URL.
params:
    usuario : external_id del paciente
======================================*/
APP.get('/verConsultas/:external_id/:usuario_id',  [verifyToken, verifyAdminAnduserOrMed],(request, response) => {

    let external_id = request.params.external_id;

    let usuario_id = request.params.usuario_id;

    Usuario.findOne({'estado' : true, 'external_id' : usuario_id}, (error, usuarioEncontrado)=>{   

        if(error){
            return helpers.errorMessage(response, 500, "Ocurrió un error al cargar las consultas");
        }
        if(!usuarioEncontrado){
            return helpers.errorMessage(response, 400, "No existe la persona a ver las consultas");
        }  
        if(!usuarioEncontrado.historia){
            return helpers.errorMessage(response, 400, "La persona aún no tiene consultas");
        }
        
        Medico.findOne({'estado' : true, 'external_id' : external_id}, (error, medicoEncontrado) =>{
            if(error){
                return helpers.errorMessage(response, 500, "Ocurrió un error al cargar las consultas");
            }
            if(!medicoEncontrado){
                return helpers.errorMessage(response, 400, "No existe el médico que desea consultar");
            }  
            if(!medicoEncontrado.citas){
                return helpers.errorMessage(response, 400, "La persona aún no tiene consultas con ese médico");
            }

            Consulta.find({'estado' : true, 'historia' : usuarioEncontrado.historia})
                    .select(CONSULTA_PARAMS)
                    .populate({
                        path: 'cita',
                        match : { 'medico' : medicoEncontrado.id},
                        select : `${CITA_PARAMS} -_id`
                    }).exec((error, consultasEncontradas)=>{
                    
                        if(error){
                            return helpers.errorMessage(response, 500, "Ocurrió un error al cargar las consultas");
                        }
                        if(!consultasEncontradas){
                            return helpers.errorMessage(response, 400, "La persona aún no tiene consultas con ese médico");
                        }
    
                        return helpers.successMessage(response, 200, consultasEncontradas);
                    });
        });
    });
});

/*====================================
Ver todas las consultas de determinado
 paciente
external_id del paciente por URL.
======================================*/
APP.get('/verConsultasPaciente/:external_id', [verifyToken, verifyAdminOrUser], (request, response) => {

    let external_id = request.params.external_id;

    Usuario.findOne({ 'estado': true, 'external_id': external_id }, (error, usuarioEncontrado) => {

        if (error) {
            return helpers.errorMessage(response, 500, 'Ocurrió un error');
        }

        if (!usuarioEncontrado) {
            return helpers.errorMessage(response, 400, 'No se encontró el usuario');
        }

        if (!usuarioEncontrado.historia) {
            return helpers.errorMessage(response, 400, 'El usuario no cuenta con consultas');
        }

        Consulta.find({ 'estado': true, 'historia': usuarioEncontrado.historia })
            .select(CONSULTA_PARAMS)
            .populate({
                path: 'cita',
                select: `${CITA_PARAMS} -_id medico`,
                populate: {
                    path: 'medico',
                    select: `${PERSON_PARAMS}`
                }
            }).exec((error, consultasEncontradas) => {
                if (error) {
                    return helpers.errorMessage(response, 500, 'Ocurrió un error');
                }

                if (!consultasEncontradas) {
                    return helpers.errorMessage(response, 400, 'La persona aún no tiene consultas con ese médico');
                }

                return helpers.successMessage(response, 200, consultasEncontradas);
            });
    });
});


/*====================================
Modificar una consulta de determinado usuario.
Se requiere el external_id de la consulta a modificar.
Campos que se pueden modificar son:
   - diagnostico
   - motivo
   - receta                                 
======================================*/
APP.put('/modificarConsulta/:external_id', [verifyToken, verifyAllMed], (request, response) => {
    let external_id = request.params.external_id;

    Consulta.findOne({ 'estado': true, 'external_id': external_id }, (error, consultaEncontrada) => {

        if (error) {
            return helpers.errorMessage(response, 500, 'Error en el servidor');
        }

        let consultaBody = request.body;

        if (under_score.isEmpty(consultaBody)) {
            return helpers.errorMessage(response, 400, 'No existe información para modificar');
        }


        if (!consultaEncontrada) {
            return helpers.errorMessage(response, 400, 'No se ha encontrado la consulta');
        }

        consultaEncontrada.diagnostico = consultaBody.diagnostico || consultaEncontrada.diagnostico;
        consultaEncontrada.motivo = consultaBody.motivo || consultaEncontrada.motivo;
        consultaEncontrada.receta = consultaBody.receta || consultaEncontrada.receta;

        consultaEncontrada.save((error, consultaGuardada) => {
            if (error) {
                return helpers.errorMessage(response, 400, 'Error al guardar la consulta');
           }

            return helpers.successMessage(response, 200, consultaGuardada);
        });
    });
});


module.exports = APP;