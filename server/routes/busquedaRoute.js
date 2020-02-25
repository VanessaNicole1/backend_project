/*===================================
Libraries
=====================================*/
let express =  require('express');
let under_score = require('underscore');
/*===================================
Models
=====================================*/
let Medico = require('../models/medico/medico');
let Usuario = require('../models/usuario');
let Especialidad = require('../models/medico/especialidad');
/*===================================
Own
=====================================*/
const APP  = express();
let helpers = require("../helpers/functions");
let  { verifyAdmin, verifyToken } = require('../middlewares/authentication');

APP.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {

        case 'usuarios':
            promesa = buscarUsuarios(regex);
            break;

        case 'medicos':
            promesa = buscarMedicos(regex);
            break;

        case 'especialidades':

            promesa = buscarEspecialidad(regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda sólo son: usuarios medicos',
                error: { message: 'Tipo de tabla/coleccion no válido' }
            });

    }

    promesa.then(data => {

        res.status(200).json({
            ok: true,
            [tabla]: data
        });

    })

});

// ==============================
// Busqueda general
// ==============================
APP.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');


    Promise.all([
            buscarMedicos(regex),
            buscarUsuarios(regex)
        ])
        .then(respuestas => {

            res.status(200).json({
                ok: true,
                medicos: respuestas[0],
                usuarios: respuestas[1]
            });
        })
});


function buscarUsuarios(regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({'estado' : true})
            .or([{ 'nombres': regex }, { 'correo': regex }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

function buscarMedicos(regex) {

    return new Promise((resolve, reject) => {

        Medico.find({ 'estado' : true})
            .or([{ 'nombres': regex }, { 'correo': regex }])
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos)
                }
            });
    });
}


function buscarEspecialidad(regex) {

    return new Promise((resolve, reject) => {

        Especialidad.find({ 'estado': true })
            .or([{ 'nombre': regex }])
            .exec((err, especialidades) => {

                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(especialidades)
                }
            });
    });
}


module.exports = APP;