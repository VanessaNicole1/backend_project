/*===================================
Libraries
=====================================*/
const JWT = require('jsonwebtoken');

/*===================================
Own
=====================================*/
let helpers = require("../helpers/functions");

/*===================================
Variables
=====================================*/
const MED_ROLE = process.env.MED_ROLE;
const USER_ROLE = process.env.USER_ROLE;
const ADMIN_ROLE = process.env.ADMIN_ROLE;
const UNAUTHORIZED = "Acceso denegado";

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
Verificar Rol Admin y Usuario o Médico
=====================================*/
let verifyAdminAnduserOrMed = (request, response, next) =>{

    let user = request.usuario;
    let external_id = request.params.usuario_id;

    if(compareAllUser(user, USER_ROLE, external_id)){
        next();
        return;
    }
    external_id = request.params.external_id;
    if(compareAllUser(user, MED_ROLE, external_id)){
        next();
        return;
    }
    if(compareUserRole(user, ADMIN_ROLE)){
        next();
        return;
    }
    return helpers.errorMessage(response, 401, UNAUTHORIZED);
};

/*===================================
Verifica Rol de administrador
=====================================*/
let verifyAdmin = (request, response, next) =>{

    let user = request.usuario;

    if(compareUserRole(user, ADMIN_ROLE)){
        next();
        return;
    }
    return helpers.errorMessage(response, 401, UNAUTHORIZED);
};

/*===================================
Verifica Rol de médico
=====================================*/
let verifyAllMed = (request, response, next) =>{

    let user = request.usuario;

    if(compareUserRole(user, MED_ROLE)){
        next();
        return;
    }
   return helpers.errorMessage(response, 401, UNAUTHORIZED);
};

/*===================================
Verifica Rol de médico y su sesión actual
=====================================*/
let verifyMed = (request, response, next) =>{

    let user = request.usuario;

    let external_id = request.params.external_id;

    if(compareAllUser(user, MED_ROLE, external_id)){
        next();
        return;
    }
    return helpers.errorMessage(response, 401, UNAUTHORIZED);
};

/*===================================
Verifica Rol de Usuario y su sesión actual
=====================================*/
let verifyUser = (request, response, next) =>{

    let user = request.usuario;

    let external_id = request.params.external_id;

    if(compareAllUser(user, USER_ROLE, external_id)){
        next();
        return;
    }
    return helpers.errorMessage(response, 401, UNAUTHORIZED);
};

/*===================================
Verificar Admin o Usuario
=====================================*/
let verifyAdminOrUser = (request, response, next) =>{

    let user = request.usuario;

    let external_id = request.params.external_id;

    if(compareAllUser(user, USER_ROLE, external_id)){
        next();
        return;
    }
    if(compareUserRole(user, ADMIN_ROLE)){
        next();
        return;
    }
    return helpers.errorMessage(response, 401,UNAUTHORIZED); 
};

/*===================================
Verificar Admin o Cualquier usuario
=====================================*/
let verifyAdminOrAllUser = (request, response, next) =>{

    let user = request.usuario;
    if(compareUserRole(user, USER_ROLE) || compareUserRole(user, ADMIN_ROLE)){
        next();
        return;
    }
    return helpers.errorMessage(response, 401, UNAUTHORIZED);
};

/*===================================
Verificar admin o Medico
=====================================*/
let verifyAdminOrMed = (request, response, next) =>{

    let user = request.usuario;

    let external_id = request.params.external_id;

    if(compareAllUser(user, MED_ROLE, external_id)){
        next();
        return;
    }
    if(compareUserRole(user, ADMIN_ROLE)){
        next();
        return;
    }
    return helpers.errorMessage(response, 401,UNAUTHORIZED);
};

/******************************************************************************************************
Métodos Auxiliares
*******************************************************************************************************/

/*===================================
Compara el rol del usuario
=====================================*/
let compareUserRole = (user, rol ) =>{
    if(user.role === rol){
            return true;
    }
    return false;
} 
/*===================================
Compara el external_id del usuario
=====================================*/
let compareExternalUser = (user, external_id) =>{
    if(external_id === user.person.external_id){
       return true;
    }
    return false;
}
/*===================================
Compara el external_id del usuario y su ROL
=====================================*/
let compareAllUser = (user, rol, external_id) =>{
   
    if(compareUserRole(user, rol)){
        if(compareExternalUser(user, external_id)){
           return true;
        }
        return false;
    }
}
module.exports = {
    verifyToken, 
    verifyAdmin,
    verifyMed, //OJOO
    verifyUser, 
    verifyAdminOrUser, 
    verifyAdminOrMed, 
    verifyAdminOrAllUser, 
    verifyAllMed,  
    verifyAdminAnduserOrMed 
}