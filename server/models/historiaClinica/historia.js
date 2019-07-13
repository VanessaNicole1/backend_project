/*Mongoose*/
let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let historialSchema = new Schema({
    external_id : {
        type : String,
        required : true 
    },
    enfermedades : {
        type : String,
        required : [true, 'Se necesita las enfermedades']
    },
    enfermedadesHereditarias : {
        type : String,
        required : [true, 'Se necesita las enfermedades hereditarias']
    },
    habitos : {
        type : String,
        required : [true, 'Se necesita los hábitos de la persona']
    },
    persona : {
            type: Schema.Types.ObjectId,
            ref : 'Persona' 
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

module.exports = mongoose.model('Rol', historiaSchema);