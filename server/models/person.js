/*Mongoose*/
let mongoose = require('mongoose');
/*Unique-validator*/
let unique_validator = require('mongoose-unique-validator');
/*UUID*/
const UUID = require('uuid/v4');

/*ROL SCHEMA*/
let Rol = require('./rol');

let Schema = mongoose.Schema;

let personSchema = new Schema({
    
    external_id : {
        type : String,
        required : true
    },
    cedula : {
        type : String,
        unique : true,
        required : [true, 'La cédula es necesaria']
    },
    nombres : {
        type : String,
        required : [true, 'Nombre(s) necesario']
    },
    apellidos : {
        type : String,
        required : [true, 'Apellido(s) necesario']
    },
    edad : {
        type : Number,
        required : [true, 'La edad es necesaria']
    },
    genero : {
        type : Boolean,
        required : [true, 'El género es necesario']
    },
    telefono : {
        type : String,       
        required : [true, 'El teléfono es necesario']
    },
    direccion : {
        type : String,
        required : [true, 'La dirección es necesaria']
    },
    correo : {
        type : String,
        unique : true,
        required : [true, 'El correo es necesario']
    },
    password : {
        type : String,
        required : [true, 'La contraseña es necesaria']
    },
    foto : {
        type : String,
        required : false
    },
    rol : Rol.schema
});

personSchema.plugin(unique_validator, {message :  '{PATH} debe de ser único'});

personSchema.methods.toJSON = function(){
    let person = this;
    let personObject = person.toObject();
    delete personObject.password;
    return personObject;
}

module.exports = mongoose.model('Person', personSchema);