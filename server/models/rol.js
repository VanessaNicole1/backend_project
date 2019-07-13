/*Mongoose*/
let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let rolSchema = new Schema({
    nombre : {
        type : String,
        required : [true, 'Nombre del rol necesario'],
        unique : true
    },
    external_id : {
        type : String,
        required : true
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

module.exports = mongoose.model('Rol', rolSchema);