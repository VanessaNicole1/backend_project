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
    motivo: {
        type: String,
        required: [true, 'Se requiere el motivo de la consulta']
    },
    estado: {
        type: Boolean,
        required: [true, 'Se requiere el estado de la conuslta']
    },
    historia: {
        type: Schema.Types.ObjectId,
        ref: 'Historia',
        required : [true, 'Es necesaria el historial clínico de la persona']
    },
    receta : {
        type : String
    },
    cita : {
        type : Schema.Types.ObjectId,
        ref : 'Cita',
        required : [true, 'La consulta debe pertenecer a una cita previamente reservada']    
    },
    created_At: {
        type: Date,
        required: [true, 'El createdAt es requerido']
    },
    updated_At: {
        type: Date,
        required: [true, 'El updatedAt es requerido']
    }
});

consultaSchema.methods.toJSON = function(){
    let consulta = this;
    let consultaObject = consulta.toObject();
    delete consultaObject.created_At;
    delete consultaObject.updated_At;
    delete consultaObject.estado;
    return consultaObject;
}


module.exports = moongose.model('Consulta', consultaSchema);
