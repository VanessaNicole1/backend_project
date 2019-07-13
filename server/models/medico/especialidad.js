/*Mongoose*/
let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let especialidadShema = new Schema({
    nombre : {
        type : String,
        required : [true, 'Nombre de la especialidad necesaria'],
        unique : true
    },
    external_id : {
        type : String,
        required : true
    },
    estado : {
        type : Boolean,
        required : [true, 'Se requiere el estado']
    },
    descripcion : {
        type : String,
        required : [true, 'La descripción es necesaria']
    },
    created_At : {
        type : Date,
        required : [true, 'El created_At es requerido']
    },
    updated_At : {
        type : Date,
        required : [true, 'El updated_At es requerido']
    }
});

module.exports = mongoose.model('Especialidad', especialidadShema);