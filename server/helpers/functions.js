/*===================================
Función para devolver errores
=====================================*/
let errorMessage = (response, errorType, message, error) => {
    return response.status(errorType).json({
        ok: false,
        mensaje: message,
        error 
    });
}

/*===================================
Función para devolver solicitudes
=====================================*/
let successMessage = (response, successType, data) =>{
    return response.status(successType).json({
        ok: true,
        data
    });
}

/*===================================
Definir horarios fijos para el médico
=====================================*/
function transformarHora(fecha) {

    //let transformar = fecha.setTime(fecha.getTime() - (1000 * 60 * 60 * 5));

    return fecha;
}

/*===================================
Crear correo automático para el médico
=====================================*/
let getCorreo = (nombres, apellidos, cedula)=>{

    let namesArray = nombres.toLowerCase().split(' ');
    let lastNamesArray = apellidos.toLowerCase().split(' ');

    const EMAIL = "@med.com";

    if(namesArray.length > 1 && lastNamesArray.length > 1){
        let correo = `${namesArray[0]}${namesArray[1].substr(0, 2)}.${lastNamesArray[0]}${cedula.substr(-3)}${EMAIL}`;

        return correo;             
    }

    return null;
}

let verifyRole = (email)=>{

    let adminRole = "@admin.com";
    let medRole = "@med.com";

    let currentRole = email.includes(adminRole) ? process.env.ADMIN_ROLE : 
                      email.includes(medRole) ? process.env.MED_ROLE : process.env.USER_ROLE;

    return currentRole;
}


module.exports = {
    errorMessage,
    successMessage,
    transformarHora, 
    getCorreo,
    verifyRole
}