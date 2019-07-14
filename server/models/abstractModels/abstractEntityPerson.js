/*Mongoose*/
let mongoose = require('mongoose');
/*Util for inheritance*/
const util = require('util');

let Schema = mongoose.Schema;

let AbstractEntityPerson = function(){
    
    Schema.apply(this, arguments);

    this.add({
    
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
        created_At : {
            type : String,
            required : [true, 'El created_At es requerido']
        },
        updated_At : {
            type : String,
            required : [true, 'El updated_At es requerido']
        }
    });
}
util.inherits(AbstractEntityPerson, Schema);

module.exports = AbstractEntityPerson