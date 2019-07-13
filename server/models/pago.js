/*Mongoose*/
let mongoose = require('mongoose');
/*Unique-validator*/
let unique_validator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

const TIPOS_VALIDOS = {
    values : ['Transacción', 'Efectivo'],
    message : '{VALUE} no es un tipo válido'
}

let pagoSchema = new Schema({
    
    external_id : {
        type : String,
        required : [true, 'El external es necesario'],
        unique : true
    },
    estado : {
        type : Boolean,
        required : [true, 'Se requiere el estado']
    },
    tipo :  {
        type : String,
        required : [true, 'Se requiere un tipo de pago'],
        enum : TIPOS_VALIDOS
    },
    cantidad : {
        type : Number,
        required : [true, 'La cantidad del pago es necesaria']
    },
    persona : {
        type : Schema.Types.ObjectId,
        ref : 'Usuario'
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

pagoSchema.plugin(unique_validator, {message :  '{PATH} debe de ser único'});

module.exports = mongoose.model('Pago', pagoSchema);