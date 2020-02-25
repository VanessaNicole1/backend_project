/*Mongoose*/
let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let citaSchema = new Schema({
    external_id : {
        type : String,
        required : true
    },
    paciente: {
        type : Schema.Types.ObjectId,
        ref : 'Usuario',
        required : [true, 'Se necesita una persona para agendar la cita']
    },
    medico : {
        type : Schema.Types.ObjectId,
        ref : 'Medico',
        required : [true, 'Se necesita un médico para agendar la cita']
    },
    estado : {
        type : Boolean,
        required : [true, 'Es necesario un estado para ls cita']
    },
    fecha : {
        type : String,
        required : [true,  "La fecha de la cita es necesaria"]
    },
    hora : {
        type : String,
        required : [true, "La hora de la cita es necesaria "]
    },
    precioConsulta : {
        type : Number,
        required : [true, 'Es necesario el precio de la consulta']
    },
    consulta : {
        type : Schema.Types.ObjectId,
        ref : 'Consulta'
    },
    realizada :{
        type : Boolean
    },
    asistencia : {
        type : Boolean
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


citaSchema.methods.toJSON = function(){
    let cita = this;
    let citaObject = cita.toObject();
    delete citaObject.created_At;
    delete citaObject.updated_At;
    delete citaObject.estado;
    return citaObject;
}

module.exports = mongoose.model('Cita', citaSchema);