/*===================================
Libraries
=====================================*/
let express =  require('express');
const UUID = require('uuid/v1');

/*===================================
Models
=====================================*/
let Rol = require('../models/rol');
/*===================================
OWN
=====================================*/
let helpers = require("../helpers/functions");


/*===================================
Variables
=====================================*/
const APP  = express();


/*===================================
Obtener la lista de roles
=====================================*/
APP.get('/', (request, response)=>{

    Rol.find({}).exec((error, roles) =>{
            if(error){
                return helpers.errorMessage(response, 500, 'Error al obtener la lista de roles', error);
            }
            return helpers.successMessage(response, 200, roles);
        });
});

/*===================================
Crear rol
params:
    nombreRol
=====================================*/
APP.post('/', (request, response)=>{

    let body = request.body;

    let rol = new Rol({
        nombre : body.nombre,
        external_id : UUID()        
    });

    rol.created_At = new Date(),
    rol.updated_At = new Date()

    rol.save((error, rolGuardado)=>{
        if(error){
            return helpers.errorMessage(response, 500, 'Error al crear rol', error);
        }
        return helpers.successMessage(response, 201, rolGuardado);
    });
});

module.exports = APP;