/*Mongoose*/
let mongoose = require('mongoose');
/*Unique-validator*/
let unique_validator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let rolSchema = new Schema({
    nombre : {
        type : String,
        required : [true, 'Nombre(s) necesario']
    },
    external_id : {
        type : String,
        required : true
    }
});

rolSchema.plugin(unique_validator, {message : '{PATH} debe de ser único'});

module.exports = mongoose.model('Rol', rolSchema);