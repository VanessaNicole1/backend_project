/*===================================
Libraries
=====================================*/
const BCRYPT = require('bcrypt');
let express =  require('express');
const JWT = require('jsonwebtoken');
let under_score = require('underscore');
/*===================================
Models
=====================================*/
let Admin = require('../models/admin');
let Medico = require('../models/medico/medico');
let Usuario = require('../models/usuario');
/*===================================
Own
=====================================*/
let helpers = require('../helpers/functions');

/*===================================
Variables
=====================================*/
const APP = express();


/*===================================
Login
Params:
    -email,
    -password
=====================================*/
APP.post('/', (request, response)=>{

    let body = infoBody(request.body);

    if(!body.correo || !body.password){
        return helpers.errorMessage(response, 400, "Se necesita toda la información");
    }

    const EMAIL = body.correo;
    const PASSWORD = body.password;

    const CURRENT_ROLE = helpers.verifyRole(EMAIL);
    
    let currentPerson = CURRENT_ROLE === process.env.MED_ROLE ? Medico :  
                        CURRENT_ROLE === process.env.ADMIN_ROLE ? Admin : Usuario;

    currentPerson.findOne({'estado': true, 'correo' : EMAIL}, (error, person) =>{

        if(error){
            return helpers.errorMessage(response, 500, "Ocurrió un error al loguearse", error);
        }

        if(!person){
            return helpers.errorMessage(response, 400, "(Email) o contraseña incorrectas");
        }

        if(!BCRYPT.compareSync(PASSWORD, person.password)){
            return helpers.errorMessage(response, 400, "Email o (contraseña) incorrectas");
        }   

        let user = {
             role : CURRENT_ROLE,
             person
        }

        let token = JWT.sign({
            usuario : user
        }, process.env.SEED, {expiresIn : process.env.EXPIRES});

        let finalUser = {
            user,
            token
        }

        return helpers.successMessage(response, 200, finalUser);
    });
});



/*===================================
Métodos Auxiliares
=====================================*/
let infoBody = (body) => {
    
    return under_score.pick(body, 
                            [
                            'correo', 
                            'password',
                            ]);
}

module.exports = APP;



