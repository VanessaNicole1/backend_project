/*Server Express*/
let express =  require('express');
/*ROL MODEL*/
let Rol = require('../models/rol');
/*UUID*/
const UUID = require('uuid/v1');

const APP  = express();

APP.get('/', (request, response)=>{

    Rol.find({}).exec((error, rolsResponse) =>{
            if(error){
                return response.status(500).json({
                    ok : false,
                    mensaje : 'Error al obtener la lista de roles',
                    errores : error
                });
            }
            response.status(200).json({
                ok : true,
                roles : rolsResponse
            });
        });

});

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
            return response.status(400).json({
                ok : false,
                mensaje : 'Error al crear el rol',
                errores : error
            });
        }
        response.status(201).json({
            ok : true,
            rolGuardado
        });
    });
});

module.exports = APP;