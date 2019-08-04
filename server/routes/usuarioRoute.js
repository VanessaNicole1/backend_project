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
let Admin = require('../models/admin');
let Historial = require('../models/historiaClinica/historia');
let Medico = require('../models/medico/medico');
let Pago = require('../models/pago');
let Rol = require('../models/rol');
let Usuario = require('../models/usuario');
/*===================================
Own
=====================================*/
let helpers = require("../helpers/functions");
let  { verifyAdmin, verifyToken, verifyUser, verifyMed, verifyAdminOrUser } = require('../middlewares/authentication');

/*===================================
Variables
=====================================*/
const APP  = express();
const PAGO_PARAMS = 'cantidad tipo external_id';
const HISTORIAL_PARAMS = 'enfermedades enfermedadesHereditarias habitos external_id'

/*===================================
Listar todos la lista de personas activas
=====================================*/
APP.get('/listar', [verifyToken, verifyAdmin], (request, response)=>{

    Usuario.find({'estado' : true})
            .select('-_id')
            .exec((error, personas) => {

                if(error){
                    return helpers.errorMessage(response, 500, 'Error al obtener la lista de personas', error);
                }
                return helpers.successMessage(response, 200, personas);
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
    
    if(under_score.isEmpty(usuarioBody)){
        return helpers.errorMessage(response, 400,'Ingrese los parámetros necesarios de la persona' );
    }
        
    Rol.findOne({'nombre' : 'USER_ROLE'}, (error, rolEncontrado) =>{
        
        if(error){
            return helpers.errorMessage(response, 500, 'Error en el servidor', error);
        }
        if(!rolEncontrado){
            return helpers.errorMessage(response, 400,'No se ha encontrado el rol' );
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
                    return helpers.errorMessage(response, 400, 'Error al guardar la persona', error);
            }
            
            return helpers.successMessage(response, 201, usuarioGuardado);
        });
    });

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
    
    let usuarioBody = request.body;
    
    if(under_score.isEmpty(usuarioBody)){
        return helpers.errorMessage(response, 400,'No hay nada que modificar');
    }

    Usuario.findOne({'external_id' : external_id, 'estado' : true }, (error, usuarioEncontrado) =>{
        
        if(error){
            return helpers.errorMessage(response, 500, 'Error en el servidor', error);
        }
        if(!usuarioEncontrado){
            return helpers.errorMessage(response, 400,'No se ha encontrado la persona');
        }   
            
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
                return helpers.errorMessage(response, 400, 'Error al modificar la persona', error);
            }
            return helpers.successMessage(response, 200, usuarioModificado);
        });
       
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
           return helpers.errorMessage(response, 500, 'Error en el servidor', error);
        }
        if(!usuarioEncontrado){
            return helpers.errorMessage(response, 400,'No se ha encontrado la persona');
        }
        
        usuarioEncontrado.updated_At = new Date();
        usuarioEncontrado.estado = false;
        
        usuarioEncontrado.save((error, usuarioEliminado) => {

            if(error){
                return helpers.errorMessage(response, 400,'Error al eliminar la persona');
            }            
            return helpers.successMessage(response, 200, usuarioEliminado);
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
                path :'pagos',
                select : `${PAGO_PARAMS} -_id`
            })
            .exec((error, personas) => {

                if(error){
                   return helpers.errorMessage(response, 500, 'Error al obtener la lista de pagos de la persona', error);
                }
                return helpers.successMessage(response, 200, personas);
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
            return helpers.errorMessage(response, 500, 'Error en el servidor', error);
        }
        if(!personaEncontrada){
            return helpers.errorMessage(response, 400,'No se ha encontrado la persona');
        }
    
        let pagoBody = {
            cantidad : request.body.cantidad,
            tipo : request.body.tipo
        }

        if(under_score.isEmpty(pagoBody)){
            return helpers.errorMessage(response, 400,'Se necesita la información del pago a guardar');
        }
        pagoBody.external_id = UUID();
        pagoBody.created_At = new Date();
        pagoBody.updated_At = new Date();
        pagoBody.persona = personaEncontrada.id;

        let pago = new Pago(pagoBody);  

        pago.save((error, pagoGuardado)=>{
            if(error){
                return helpers.errorMessage(response, 500,'Error al guardar el pago', error);
            }

            personaEncontrada.pagos.push(pago);
            personaEncontrada.save((error)=>{
                
                if(error){
                    return helpers.errorMessage(response, 400,'Error al agregar el pago a la persona');
                }
                return helpers.successMessage(response, 201, pagoGuardado);
            });
        });
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

    Usuario.findOne({ 'estado': true, 'external_id': external_id })
        .select('-_id -pagos -citas')
        .populate({
            path: 'historia',
            select : `${HISTORIAL_PARAMS} -_id`,
            match: { 'estado': true }
        })
        .exec((error, usuarioEncontrado) => {

            if (error) {
                return helpers.errorMessage(response, 500, 'Error al extraer el historial del usuario', error);
            }

            if(!usuarioEncontrado){
                return helpers.errorMessage(response, 400, 'No existe el usuario');
            }

            if(!usuarioEncontrado.historia){
                return helpers.errorMessage(response, 400, 'La persona aún no tiene historia clínica');
            }
            return helpers.successMessage(response, 200, usuarioEncontrado);
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
       return helpers.errorMessage(response, 400, 'Por favor enviar la información necesaria');
    }
    if(!body.medico){
        return helpers.errorMessage(response, 400,'Se necesita la información del médico que crea la historia');
    }
    
    Usuario.findOne({ 'estado': true, 'external_id': external_id }, (error, usuarioEncontrado) => {

        if (error) {
            return helpers.errorMessage(response, 500, 'Ocurrio un error en el servidor');
        }

        if (!usuarioEncontrado) {
            helpers.errorMessage(response, 400,'No se encontró el usuario');
        }

        if(usuarioEncontrado.historia){
            return helpers.errorMessage(response, 400,'La persona ya tiene asignada una historia clínica');
        }

        Medico.findOne({'estado' : true, 'external_id' : body.medico}, (error, medicoEncontrado) =>{

            if(!medicoEncontrado){
                return helpers.errorMessage(response, 400,'No se encontró el médico');
            }

            let historiaBody = {
                enfermedades: body.enfermedades,
                enfermedadesHereditarias: body.enfermedadesHereditarias,
                habitos: body.habitos,
                external_id : UUID(),
                estado :  true,
                created_At : helpers.transformarHora(new Date()),
                updated_At : helpers.transformarHora(new Date()),
                persona : usuarioEncontrado.id,
                medico : medicoEncontrado.id
            }
            
            let historia = new Historial(historiaBody);
    
            historia.save((error, historialGuardado) => {
    
                if(error) {
                    return helpers.errorMessage(response, 400, 'Error al agregar el historial al usuario', error);               
                }
                usuarioEncontrado.historia = historialGuardado.id;
                usuarioEncontrado.save();
                
                return helpers.successMessage(response, 201, historialGuardado);
            });
        });
    });
});


APP.post('/ingresarAdmin', (request, response)=>{    
    
    let adminBody = infoBody(request.body);
    
    if(under_score.isEmpty(adminBody)){
        return helpers.errorMessage(response, 400,'Ingrese los parámetros necesarios de la persona' );
    }
        
    Rol.findOne({'nombre' : 'ADMIN_ROLE'}, (error, rolEncontrado) =>{
        
        if(error){
            return helpers.errorMessage(response, 500, 'Error en el servidor', error);
        }
        if(!rolEncontrado){
            return helpers.errorMessage(response, 400,'No se ha encontrado el rol' );
        }
        if(adminBody.password){
            adminBody.password = BCRYPT.hashSync(adminBody.password, 10);
        }
        
        adminBody.external_id = UUID();
        adminBody.estado = true;
        adminBody.created_At = new Date();
        adminBody.updated_At = new Date();
        adminBody.rol = rolEncontrado.id;
        
        let admin = new Admin(adminBody);  
        
        admin.save((error, adminGuardado)=>{
            
            if(error){
                    return helpers.errorMessage(response, 400, 'Error al guardar el administrador', error);
            }
            return helpers.successMessage(response, 201, adminGuardado);
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