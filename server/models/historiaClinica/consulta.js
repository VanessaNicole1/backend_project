/*Mongoose*/
let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let consultaSchema = new Schema({
    external_id : {
        type : String,
        required : true 
    },
    diagnostico : {
        type : String,
        required : [true, 'Se necesita el diagnostico']
    },
    fecha : {
        
    },
    habitos : {
        type : String,
        required : [true, 'Se necesita los hábitos de la persona']
    },
    persona : {
            type: Schema.Types.ObjectId,
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

module.exports = mongoose.model('Rol', historiaSchema);