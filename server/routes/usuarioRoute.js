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
let Pago = require('../models/pago');
let Rol = require('../models/rol');
let Usuario = require('../models/usuario');
let Medico = require('../models/medico/medico');
/*===================================
Own
=====================================*/
let helpers = require("../helpers/functions");

const APP  = express();

/*===================================
Listar todos la lista de personas activas
=====================================*/
APP.get('/listar', (request, response)=>{

    Usuario.find({'estado' : true})
            .exec((error, personas) => {

                if(error){
                    helpers.errorMessage(response, 500, 'Error al obtener la lista de personas', error);
                }
                helpers.successMessage(response, 200, personas);
            });
});

/*===================================
Ingresar una nueva persona 
required Params:
cedula, nombres, apellidos, edad, genero
telefono, direccion, correo, password, 
optional Params:
foto
=====================================*/
APP.post('/ingresar', (request, response)=>{    
    
    let usuarioBody = infoBody(request.body);
    
    if(!under_score.isEmpty(usuarioBody)){
        
        Rol.findOne({'nombre' : 'USER_ROLE'}, (error, rolEncontrado) =>{
            
            if(error){
                helpers.errorMessage(response, 500, 'Error en el servidor', error);
            }
            if(!rolEncontrado){
                helpers.errorMessage(response, 400,'No se ha encontrado el rol' );
            }
            if(usuarioBody.password){
                usuarioBody.password = BCRYPT.hashSync(usuarioBody.password, 10);
            }
            
            usuarioBody.external_id = UUID();
            usuarioBody.estado = true;
            usuarioBody.created_At = new Date();
            usuarioBody.updated_At = new Date();
            usuarioBody.rol = rolEncontrado.id;
            
            let usuario = new Usuario(usuarioBody);  
            
            usuario.save((error, usuarioGuardado)=>{
               
                if(error){
                     helpers.errorMessage(response, 400, 'Error al guardar la persona');
                }
                
                helpers.successMessage(response, 201, usuarioGuardado);
            });
        });
    }else{
        helpers.errorMessage(response, 400,'Ingrese los parámetros necesarios de la persona' );
    }
});

/*===================================
Modificar una persona existente.
external_id del usuario
optional Params:
nombres, apellidos, edad, genero, telefono
dirección, password, foto
=====================================*/
APP.put('/modificar/:external_id', (request, response) => {
    
    let external_id = request.params.external_id;
    
    Usuario.findOne({'external_id' : external_id, 'estado' : true }, (error, usuarioEncontrado) =>{
        
        if(error){
            helpers.errorMessage(response, 500, 'Error en el servidor', error);
        }
        if(!usuarioEncontrado){
            helpers.errorMessage(response, 400,'No se ha encontrado la persona');
        }   

        let usuarioBody = request.body;
        
        if(!under_score.isEmpty(usuarioBody)){
            
            usuarioEncontrado.nombres = usuarioBody.nombres || usuarioEncontrado.nombres;
            usuarioEncontrado.apellidos = usuarioBody.apellidos || usuarioEncontrado.apellidos;
            usuarioEncontrado.edad = usuarioBody.edad || usuarioEncontrado.edad;
            usuarioEncontrado.genero = usuarioBody.genero || usuarioEncontrado.genero;
            usuarioEncontrado.telefono = usuarioBody.telefono || usuarioEncontrado.telefono;
            usuarioEncontrado.direccion = usuarioBody.direccion || usuarioEncontrado.direccion;
            if(usuarioBody.password){
                usuarioEncontrado.password = BCRYPT.hashSync(usuarioBody.password, 10);
            }
            usuarioEncontrado.foto = usuarioBody.foto || usuarioEncontrado.foto;
            usuarioEncontrado.updated_At = new Date();
            
            usuarioEncontrado.save((error, usuarioModificado) => {
                if(error){
                    helpers.errorMessage(response, 400, 'Error al modificar la persona');
                }
                helpers.successMessage(response, 200, usuarioModificado);
            });
        }else{
            helpers.errorMessage(response, 400,'No hay nada que modificar');
        }
    });
    
});

/*===================================
Eliminado Lógico de una persona
external_id del usuario
=====================================*/
APP.put('/eliminar/:external_id', (request, response) => {

    let external_id = request.params.external_id;

    Usuario.findOne({'external_id' : external_id, 'estado' : true}, (error, usuarioEncontrado) =>{
        
        if(error){
            helpers.errorMessage(response, 500, 'Error en el servidor', error);
        }
        if(!usuarioEncontrado){
            helpers.errorMessage(response, 400,'No se ha encontrado la persona');
        }
        
        usuarioEncontrado.updated_At = new Date();
        usuarioEncontrado.estado = false;
        
        usuarioEncontrado.save((error, usuarioEliminado) => {

            if(error){
                helpers.errorMessage(response, 400,'Error al eliminar la persona');
            }            
            helpers.successMessage(response, 200, usuarioEliminado);
        });
    });
});

/******************************************************************************************************
                                    USUARIO - PAGOS
*******************************************************************************************************/

/*===================================
Listar los pagos de determinada usuario activa
external_id del usuario a consultar
=====================================*/
APP.get('/listarPagos/:external_id', (request, response)=>{

    let external_id = request.params.external_id;

    Usuario.find({'estado' : true, 'external_id' : external_id})
            .populate({
                path :'pagos'
            })
            .exec((error, personas) => {

                if(error){
                    helpers.errorMessage(response, 500, 'Error al obtener la lista de pagos de la persona', error);
                }
                helpers.successMessage(response, 200, personas);
           
            });
});

/*===================================
Ingresar un nuevo Pago de una persona 
external_id de la persona
Params:
    -cantidad 
    -tipo
=====================================*/
APP.post('/ingresarPago/:external_id', (request, response)=>{

    let external_id = request.params.external_id;

    Usuario.findOne({'external_id' : external_id, "estado" : true }, (error, personaEncontrada) =>{

        if(error){
            helpers.errorMessage(response, 500, 'Error en el servidor', error);
        }
        if(!personaEncontrada){
            helpers.errorMessage(response, 400,'No se ha encontrado la persona');
        }
    
        let pagoBody = {
            cantidad : request.body.cantidad,
            tipo : request.body.tipo
        }

        if(!under_score.isEmpty(pagoBody)){
            
            pagoBody.external_id = UUID();
            pagoBody.created_At = new Date();
            pagoBody.updated_At = new Date();
            pagoBody.persona = personaEncontrada.id;
    
            let pago = new Pago(pagoBody);  
    
            pago.save((error, pagoGuardado)=>{
                if(error){
                    helpers.errorMessage(response, 500,'Error al guardar el pago', error);
                }
    
                personaEncontrada.pagos.push(pago);
                personaEncontrada.save((error)=>{
                   
                    if(error){
                        helpers.errorMessage(response, 400,'Error al agregar el pago a la persona');
                    }
                    helpers.successMessage(response, 201, pagoGuardado);
                });
            });
        }else{
            helpers.errorMessage(response, 400,'Se necesita la información del pago a guardar');
        }
    });
});

/******************************************************************************************************
                                    USUARIO - HISTORIAL
*******************************************************************************************************/        
/*====================================
Obtener el historial del usuario
external_id de usuario                                 
======================================*/
APP.get('/obtenerHistorial/:external_id', (request, response) => {

    let external_id = request.params.external_id;

    Usuario.findOne({ 'estado': true, 'external_id': external_id }, (error, usuarioEncontrado) => {

        if (error) {
            helpers.errorMessage(response, 500, 'Error en el servidor', error);
        }

        if (!usuarioEncontrado) {
            helpers.errorMessage(response, 400,'No se ha encontrado la persona');
        }

        Historial.find({ 'estado': true, 'persona': usuarioEncontrado.id })
            .populate({
                path: 'persona',
                match: { 'estado': true }
            })
            .exec((error, historialEncontrado) => {

                if (error) {
                    helpers.errorMessage(response, 500, 'Error al extraer el historial del usuario', error);
                }

                helpers.successMessage(response, 200, historialEncontrado);
            });
    });

});

/*====================================
Ingresar un historial clínico a un usuario
external_id del usuario por la URL
required params:
  * enfermedades, enfermedadesHereditarias, habitos, medico : external_id_médico.
======================================*/
APP.post('/agregarHistorial/:external_id', (request, response) => {

    external_id = request.params.external_id;

    let body = request.body;

    if(under_score.isEmpty(body)){
       helpers.errorMessage(response, 400, 'Por favor enviar la información necesaria');
    }
    if(!body.medico){
        helpers.errorMessage(response, 400,'Se necesita la información del médico que crea la historia');
    }
    
    Usuario.findOne({ 'estado': true, 'external_id': external_id }, (error, usuarioEncontrado) => {

        if(!usuarioEncontrado.historia){
            if (error) {
                helpers.errorMessage(response, 500, 'Ocurrio un error en el servidor');
            }
    
            if (!usuarioEncontrado) {
                helpers.errorMessage(response, 400,'No se encontró el usuario');
            }
    
            Medico.findOne({'estado' : true, 'external_id' : body.medico}, (error, medicoEncontrado) =>{
    
                if(!medicoEncontrado){
                    helpers.errorMessage(response, 400,'No se encontró el médico');
                }
    
                let historiaBody = {
                    enfermedades: body.enfermedades,
                    enfermedadesHereditarias: body.enfermedadesHereditarias,
                    habitos: body.habitos
                }
        
                historiaBody.external_id = UUID();
                historiaBody.estado = true;
                historiaBody.createdAt = new Date();
                historiaBody.updatedAt = new Date();
                historiaBody.persona = usuarioEncontrado.id;
                historiaBody.medico = medicoEncontrado.id;
        
                let historia = new Historial(historiaBody);
        
                historia.save((error, historialGuardado) => {
        
                    if (error) {
                        helpers.errorMessage(response, 400, 'Error al agregar el historial al usuario');               
                    }
        
                    helpers.successMessage(response, 201, historialGuardado);
                });
            });
        }else{
            helpers.errorMessage(response, 400,'La persona ya tiene asignada una historia clínica');
        }
    });
});

/*====================================
Modificar un historial clínico de un usuario existente
required params:
  * enfermedades, enfermedadesHereditarias, habitos                                
======================================*/

APP.put('/modificarHistorial/:external_id', (request, response) => {

    let external_id = request.params.external_id;

    Usuario.findOne({ 'estado': true, 'external_id': external_id }, (error, usuarioEncontrado) => {

        if (error) {
            helpers.errorMessage(response, 500, 'Error en el servidor', error);
        }

        if (!usuarioEncontrado) {
            helpers.errorMessage(response, 400,'No se ha encontrado la persona');
        }


        Historial.findOne({ 'estado': true, 'persona': usuarioEncontrado.id }, (error, historialEncontrado) => {

            if (error) {
                helpers.errorMessage(response, 500, 'Error en el servidor', error);
            }

            if (!historialEncontrado) {
                helpers.errorMessage(response, 400,'No se encontró  un historial para la persona');              
            }

            let historialBody = request.body;

            if (!under_score.isEmpty(historialBody)) {

                historialEncontrado.enfermedades = historialBody.enfermedades || historialEncontrado.enfermedades;
                historialEncontrado.enfermedadesHereditarias = historialBody.enfermedadesHereditarias || historialEncontrado.enfermedadesHereditarias;
                historialEncontrado.habitos = historialBody.habitos || historialEncontrado.habitos;
                historialEncontrado.updatedAt = new Date().toLocaleString();

                historialEncontrado.save((error, historialmodificado) => {

                    if (error) {
                        helpers.errorMessage(response, 500, 'Error al momento de modificar el historial clínico', error);
                    }

                    helpers.successMessage(response, 200, historialmodificado);
                });
            } else {
                helpers.errorMessage(response, 400,'No hay nada que  modificar');
            }
        });

    });
});


/******************************************************************************************************
                                    Métodos Auxiliares
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
                            'foto'
                            ]);
}



module.exports = APP;