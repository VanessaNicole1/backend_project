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


/*===================================
Verificar cédula
=====================================*/
function validarCedula(cedula) {
    var cad = cedula.trim();
    var total = 0;
    var longitud = cad.length;
    var longcheck = longitud - 1;

    if (cad !== "" && longitud === 10) {
        for (i = 0; i < longcheck; i++) {
            if (i % 2 === 0) {
                var aux = cad.charAt(i) * 2;
                if (aux > 9)
                    aux -= 9;
                total += aux;
            } else {
                total += parseInt(cad.charAt(i)); // parseInt o concatenará en lugar de sumar
            }
        }

        total = total % 10 ? 10 - total % 10 : 0;

        if (cad.charAt(longitud - 1) == total) {
            return true;
        } else {
            return false;
        }
    }
}


let getcorreoAdmin = (nombres, apellidos, cedula) => {

    let namesArray = nombres.toLowerCase().split(' ');
    let lastNamesArray = apellidos.toLowerCase().split(' ');

    const EMAIL = "@admin.com";

    if (namesArray.length > 1 && lastNamesArray.length > 1) {
        let correo = `${namesArray[0]}${namesArray[1].substr(0,2)}.${lastNamesArray[0]}${cedula.substr(-3)}${EMAIL}`;

        return correo;
    }

    return null;
}

module.exports = {
    errorMessage,
    successMessage,
    transformarHora, 
    getCorreo,
    verifyRole,
    validarCedula,
    getcorreoAdmin
}