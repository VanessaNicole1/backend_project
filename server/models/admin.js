/*Mongoose*/
let mongoose = require('mongoose');
/*Unique-validator*/
let unique_validator = require('mongoose-unique-validator');
/*AbstractEntityPerson import*/
let AbstractEntityPerson = require('./abstractModels/abstractEntityPerson');

let adminSchema = new AbstractEntityPerson();

adminSchema.plugin(unique_validator, {message :  '{PATH} debe de ser único'});

adminSchema.methods.toJSON = function(){
    let admin = this;
    let adminObject = admin.toObject();
    delete adminObject.password;
    delete adminObject.created_At;
    delete adminObject.updated_At;
    delete adminObject.estado;
    return adminObject;
}

module.exports = mongoose.model('Admin', adminSchema);
