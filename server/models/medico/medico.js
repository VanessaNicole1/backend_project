/*===================================
Libraries
=====================================*/
let mongoose = require('mongoose');
let unique_validator = require('mongoose-unique-validator');

/*===================================
Models
=====================================*/
let AbstractEntityPerson = require('../abstractModels/abstractEntityPerson');

let Schema = mongoose.Schema;

let medicoSchema = new AbstractEntityPerson();
medicoSchema.add({
    numeroRegistro : {
        type : String,
        required : [true, 'Es necesario un número de registro'],
        unique : true
    },
    citasDiarias : {
        type : Number,
        required : [true, 'Es necesario un número de citas diarias del médico']
    },
    sueldo : {
        type : Number,
        required : [true, 'Es necesario un sueldo para el doctor']
    },
    especialidades : [
        {
            type: Schema.Types.ObjectId,
            ref : 'Especialidad' 
        }
    ],
    consultas : [
        {
            type: Schema.Types.ObjectId,
            ref : 'Consulta' 
        }
    ]
});

medicoSchema.plugin(unique_validator, {message :  '{PATH} debe de ser único'});

medicoSchema.methods.toJSON = function(){
    let medico = this;
    let medicoObject = medico.toObject();
    delete medicoObject.password;
    return medicoObject;
}

module.exports = mongoose.model('Medico', medicoSchema);