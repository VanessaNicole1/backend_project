/*===================================
Libraries
=====================================*/
let mongoose = require('mongoose');
let unique_validator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let especialidadSchema = new Schema({
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
    precioConsulta : {
        type : Number,
        required : [true, 'Se requiere un precio de consulta de acuerdo a la Esspecialidad']
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

especialidadSchema.plugin(unique_validator, {message :  '{PATH} debe de ser único'});

especialidadSchema.methods.toJSON = function(){
    let especialidad = this;
    let especialidadObject = especialidad.toObject();
    delete especialidadObject.estado;
    delete especialidadObject.created_At;
    delete especialidadObject.updated_At;
    return especialidadObject;
}

module.exports = mongoose.model('Especialidad', especialidadSchema);