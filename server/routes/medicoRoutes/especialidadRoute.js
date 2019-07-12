/*Server Express*/
let express =  require('express');
/*Especialidad MODEL*/
let Especialidad = require('../../models/medico/especialidad');
/*UUID*/
const UUID = require('uuid/v1');
/*Underscore*/
let under_score = require('underscore');

const APP  = express();

/*===================================
Obtener toda la lista de las especialidades
del hospital
=====================================*/
APP.get('/listar', (request, response)=>{

    Especialidad.find({'estado' : true})
            .exec((error, especialidadesList) => {
                if(error){
                    return response.status(500).json({
                        ok : false,
                        mensaje : 'Error al obtener la lista de especialidades',
                        errores : error
                    });
                }
                response.status(200).json({
                    ok : true,
                    especialidades : especialidadesList
                });
            });
});

/*===================================
Ingresar una nueva especialidad
Params:
    -nombre
    -descripción
=====================================*/
APP.post('/ingresar', (request, response)=>{

    let especialidadBody = infoBody(request.body);
    
    especialidadBody.external_id = UUID();
    especialidadBody.created_At = new Date();
    especialidadBody.updated_At = new Date();
    especialidadBody.estado = true;

    let especialidad = new Especialidad(especialidadBody); 

    especialidad.save((error, rolGuardado)=>{
        if(error){
            return response.status(400).json({
                ok : false,
                mensaje : 'Error al crear la especialidad',
                errores : error
            });
        }
        response.status(201).json({
            ok : true,
            rolGuardado
        });
    });
});

/*===================================
Modificar una especialidad 
external_id de la especialidad
    -nombre
    -descripción
=====================================*/
APP.put('/modificar/:external_id', (request, response) => {

    let external_id = request.params.external_id;

    Especialidad.findOne({'external_id' : external_id}, (error, especialidadEncontrada) =>{

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
                mensaje : 'No se ha encontrado ninguna especialidad',
                errores : error
            });
        }

        let especialidadActualizada = infoBody(request.body);
       
        especialidadActualizada.updated_At = new Date();

        Especialidad.findByIdAndUpdate(especialidadEncontrada.id, especialidadActualizada, {new: true,
                                                        runValidators : true}, 
                                                        (error, especialidadModificada) => {
            if(error){
                return response.status(408).json({
                    ok : false,
                    mensaje : 'Error al modificar la especialidad',
                    errores : error
                });
            }

            response.status(200).json({
                ok : true,
                especialidadModificada
            });
        });
    });
});

/*===================================
Eliminar logicamente una especialidad
external_id de la especialidad a eliminar. 
no params
=====================================*/
APP.put('/eliminar/:external_id', (request, response) => {

    let external_id = request.params.external_id;

    Especialidad.findOne({'external_id' : external_id, 'estado' : true}, (error, especialidadEncontrada) =>{

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
                mensaje : 'No se ha encontrado la especialidad',
                errores : error
            });
        }

        especialidadEncontrada.updated_At = new Date();
        especialidadEncontrada.estado = false;

        especialidadEncontrada.save((error, especialidadEliminada) => {
            if(error){
                return response.status(408).json({
                    ok : false,
                    mensaje : 'Error al eliminar la especialidad',
                    errores : error
                });
            }

            response.status(200).json({
                ok : true,
                especialidadEliminada
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
                            'nombre',
                            'descripcion'
                            ]);
}

module.exports = APP;