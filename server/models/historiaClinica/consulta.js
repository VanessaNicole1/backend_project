/*Mongoose*/
let moongose = require('mongoose');

let Schema = moongose.Schema;

let consultaSchema = new Schema({
    external_id: {
        type: String,
        required: true
    },
    diagnostico: {
        type: String,
        required: [true, 'Se requiere el diagnóstico']
    },
    fecha: {
        type: Date,
        required: [true, 'Se requiere la fecha de la consulta']
    },
    hora : {
        type : Date,
        required : [true, 'Se requiere la hora de consulta']
    },
    motivo: {
        type: String,
        required: [true, 'Se requiere el motivo de la consulta']
    },
    estado: {
        type: Boolean,
        required: [true, 'Se requiere el estado de la conuslta']
    },
    precioConsulta: {
        type: Number,
        required: [true, 'Se requiere el precio de la consulta']
    },
    historia: {
        type: Schema.Types.ObjectId,
        ref: 'Historial'
    },
    medico: {
        type: Schema.Types.ObjectId,
        ref: 'Medico'
    },
    receta : {
        type: Schema.Types.ObjectId,
        ref: 'Receta'
    },
    createdAt: {
        type: Date,
        required: [true, 'El createdAt es requerido']
    },
    updatedAt: {
        type: Date,
        required: [true, 'El updatedAt es requerido']
    }
});


module.exports = moongose.model('Consulta', consultaSchema);
