/*===================================
Libraries
=====================================*/
let mongoose = require('mongoose');
let unique_validator = require('mongoose-unique-validator');
/*===================================
Models
=====================================*/
let AbstractEntityPerson = require('./abstractModels/abstractEntityPerson');

let Schema = mongoose.Schema;

let usuarioSchema = new AbstractEntityPerson();
usuarioSchema.add({
    pagos : [
        {
            type: Schema.Types.ObjectId,
            ref : 'Pago' 
        }
    ],
    historia : {
        type: Schema.Types.ObjectId,
        ref : 'Historia' 
    }
});

usuarioSchema.plugin(unique_validator, {message :  '{PATH} debe de ser único'});

usuarioSchema.methods.toJSON = function(){
    let usuario = this;
    let usuarioObject = usuario.toObject();
    delete usuarioObject.password;
    return usuarioObject;
}

module.exports = mongoose.model('Usuario', usuarioSchema);

