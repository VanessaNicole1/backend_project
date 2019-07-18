/*Mongoose*/
let mongoose = require('mongoose');

let Schema = mongoose.Schema;

const NOMBRES_VALIDOS = {
    values : ['ADMIN_ROLE', 'MED_ROLE', 'USER_ROLE'],
    message : '{VALUE} no es un nombre válido'
}

let rolSchema = new Schema({
    nombre : {
        type : String,
        required : [true, 'Nombre del rol necesario'],
        unique : true,
        enum : NOMBRES_VALIDOS
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