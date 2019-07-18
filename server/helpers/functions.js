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
let successMessage = (response, successType, object) =>{
    return response.status(successType).json({
        ok: true,
        object
    });
}


module.exports = {
    errorMessage,
    successMessage
}