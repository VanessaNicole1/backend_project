/*===================================
Libraries
=====================================*/
const JWT = require('jsonwebtoken');

/*===================================
Own
=====================================*/
let helpers = require("../helpers/functions");

/*===================================
Verificar Token
params:
    request,
    response,
    next
=====================================*/
let verifyToken = (request, response, next) =>{

    let token = request.get('token');
    
    JWT.verify(token, process.env.SEED, (error, decoded) =>{

        if(error){
            return helpers.errorMessage(response, 401, "Falta autentificarse", error);
        }
        
        request.usuario = decoded.usuario;   
        next();
    });
};

/*===================================
Verifica Rol de administrador
=====================================*/
let verifyAdmin = (request, response, next) =>{

    let user = request.usuario;

    if(user.role === "ADMIN_ROLE"){
        next();
        return;
    }
    return helpers.errorMessage(response, 401, "No eres administrador");
};

/*===================================
Verifica Rol de médico
=====================================*/
let verifyMed = (request, response, next) =>{

    let user = request.usuario;

    if(user.role === "MED_ROLE"){
        next();
        return;
    }
    return helpers.errorMessage(response, 401, "No eres médico");
};

/*===================================
Verifica Rol de Usuario
=====================================*/
let verifyUser = (request, response, next) =>{

    let user = request.usuario;

    if(user.role === "USER_ROLE"){
        next();
        return;
    }
    return helpers.errorMessage(response, 401, "No eres usuario");
};

let verifyAdminOrUser = (request, response, next) =>{

    let user = request.usuario;

    if(user.role === "USER_ROLE" || user.role === "ADMIN_ROLE"){
        next();
        return;
    }
    return helpers.errorMessage(response, 401, "No estas autorizado");
};

module.exports = {
    verifyToken,
    verifyAdmin,
    verifyMed,
    verifyUser,
    verifyAdminOrUser
}