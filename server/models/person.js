/*Mongoose*/
let mongoose = require('mongoose');
/*Unique-validator*/
let unique_validator = require('mongoose-unique-validator');

/*ROL SCHEMA*/
let Rol = require('./rol');

let Schema = mongoose.Schema;

let personSchema = new Schema({
    
    external_id : {
        type : String,
        required : true
    },
    estado : {
        type : Boolean,
        required : [true, 'Se requiere el estado']
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
    rol : 
    {
        type: Schema.Types.ObjectId,
        ref : 'Rol' 
    },
    pagos : [
        {
            type: Schema.Types.ObjectId,
            ref : 'Pago' 
        }
    ],
    created_At : {
        type : Date,
        required : [true, 'El created_At es requerido']
    },
    updated_At : {
        type : Date,
        required : [true, 'El updated_At es requerido']
    }
});

personSchema.plugin(unique_validator, {message :  '{PATH} debe de ser único'});

personSchema.methods.toJSON = function(){
    let person = this;
    let personObject = person.toObject();
    delete personObject.password;
    return personObject;
}

module.exports = mongoose.model('Persona', personSchema);