/*====================================
Libraries                                 
======================================*/
let express = require('express');
const PATH = require('path');
const FS = require('fs');


let APP = express();


APP.get('/:tipo/:foto', (request, response) => {

    let tipo = request.params.tipo;
    let foto = request.params.foto;

    /**El __dirname ayuda para obtener la ruta en donde me encuentro en este momento */
    let pathImagen = PATH.resolve(__dirname, `../uploads/${tipo}/${foto}`);

    /**Verificar si el path es válido */

    if (FS.existsSync(pathImagen)) {
        response.sendFile(pathImagen);
    } else {
        let pathNoImagen = PATH.resolve(__dirname, '../assets/no-img.jpeg');
        response.sendFile(pathNoImagen);
    }
});

module.exports = APP;
