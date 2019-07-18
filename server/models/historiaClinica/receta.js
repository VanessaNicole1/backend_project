/*Mongoose*/
let moongose = require('mongoose');
/*Unique-validator*/
let unique_validator = require('mongoose-unique-validator');

let Schema = moongose.Schema;

let recetaSchema = new Schema({

    external_id: {
        type: String,
        required: [true, 'El external es necesario'],
        unique: true
    },
    indicaciones: {
        type: String,
        required: [true, 'Se requiere las indicaciones de la receta']
    },
    duracion: {
        type: Number,
        required: [true, 'La duración de la receta es requerida']
    },
    consulta: {
        type: Schema.Types.ObjectId,
        ref: 'Consulta'
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

recetaSchema.plugin(unique_validator, { message: '{PATH} debe ser único' });



module.exports = moongose.model('Receta', recetaSchema);
