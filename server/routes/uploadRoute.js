/*====================================
LIBRARIES                                 
======================================*/
let express = require('express');
const FILEUPLOAD = require('express-fileupload');
let fs = require('fs');

/*====================================
MODELOS                                 
======================================*/
let Usuario = require('../models/usuario');
let Medico = require('../models/medico/medico');
let Admin = require('../models/admin');


const APP = express();

// default options --> Middleware
APP.use(FILEUPLOAD());


/*helpers*/
let helpers = require('../helpers/functions');

APP.put('/:role/:external_id', (request, response, next) => {

    let role = request.params.role;

    let tipo = role === process.env.MED_ROLE ? "medicos" :  
               role === process.env.ADMIN_ROLE ? "admin" : 
               role === process.env.USER_ROLE ? "usuarios" : undefined;

    if(!tipo){
        return helpers.errorMessage(response, 400, "No existe tal colección");
    }

    let external_id = request.params.external_id;

    /**Tipos de colección */
    if (!request.files) {
        return helpers.errorMessage(response, 400, 'No seleccionó nada, se debe seleccionar una imagen');
    }

    /**Obtener nombre del archivo */
    let archivo = request.files.imagen;

    let nombreCortado = archivo.name.split('.');

    let extensionArchivo = nombreCortado[nombreCortado.length - 1];

    /**Extensiones válidas */
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {

        return helpers.errorMessage(response, 400, 'Extension no válida');
    }

    /**Nombre Archivo personalizado */
    let nombreArchivo = `${external_id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    /**Mover el archivo del temporal a un path específico */
    let path = `server/uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {

        if (err) return helpers.errorMessage(response, 500, 'Error al mover archivo', err);

        subirPorTipo(tipo, external_id, nombreArchivo, response);

    });

});


let subirPorTipo = (tipo, external_id, nombreArchivo, response) => {

      
    let currentPerson = tipo === "medicos" ? Medico :  
                        tipo === "admin" ? Admin : Usuario;

    currentPerson.findOne({ 'estado': true, 'external_id': external_id }, (error, usuarioEncontrado) => {

            if (error) {
                return helpers.errorMessage(response, 500, 'Ocurrió un error', error);
            }

            if (!usuarioEncontrado) {
                return helpers.errorMessage(response, 500, 'No existe tal persona', error);
            }

            let pathOld = `server/uploads/${tipo}/${usuarioEncontrado.foto}`;
            /**Si existe, elimina la foto anterior */
            if (fs.existsSync(pathOld)) {
                fs.unlinkSync(pathOld);
            }

            usuarioEncontrado.foto = nombreArchivo;

            usuarioEncontrado.save((error, usuarioActualizado) => {

                if(error){
                    return helpers.errorMessage(response, 500, "Fallo la actualización", error);
                }
                return helpers.successMessage(response, 200, usuarioActualizado);
            });
        });
}



module.exports = APP;
