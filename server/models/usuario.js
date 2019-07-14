/*Mongoose*/
let mongoose = require('mongoose');
/*Unique-validator*/
let unique_validator = require('mongoose-unique-validator');
/*AbstractEntityPerson import*/
let AbstractEntityPerson = require('./abstractModels/abstractEntityPerson');

let Schema = mongoose.Schema;

let usuarioSchema = new AbstractEntityPerson();
usuarioSchema.add({
    pagos : [
        {
            type: Schema.Types.ObjectId,
            ref : 'Pago' 
        }
    ]
}
);

usuarioSchema.plugin(unique_validator, {message :  '{PATH} debe de ser único'});

usuarioSchema.methods.toJSON = function(){
    let usuario = this;
    let usuarioObject = usuario.toObject();
    delete usuarioObject.password;
    return usuarioObject;
}

module.exports = mongoose.model('Usuario', usuarioSchema);

