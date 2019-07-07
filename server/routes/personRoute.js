/*Server Express*/
let express =  require('express');
/*ROL MODEL*/
let Rol = require('../models/rol');
/*PERSON MODEL*/
let Persona = require('../models/person');
/*UUID*/
const UUID = require('uuid/v1');
/*Underscore*/
let under_score = require('underscore');

const APP  = express();

APP.get('/', (request, response)=>{

    Persona.find({})
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

APP.post('/', (request, response)=>{

    let body = under_score.pick(request.body, 
                                ['cedula', 
                                'nombres', 
                                'apellidos',
                                'edad', 
                                'genero', 
                                'telefono', 
                                'direccion', 
                                'correo', 
                                'password',
                                'foto',
                                'rol'
                                ]);
    
    body.external_id = UUID();

    let person = new Persona(body);                            

    person.save((error, personaGuardada)=>{
        if(error){
            return response.status(400).json({
                ok : false,
                mensaje : 'Error al crear el rol',
                errores : error
            });
        }
        response.status(201).json({
            ok : true,
            personaGuardada
        });
    });
});

module.exports = APP;