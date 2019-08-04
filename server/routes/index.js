/*===================================
Libraries
=====================================*/
let express =  require('express');

/*===================================
Routes
=====================================*/
let rolRoutes = require('./rolRoute');
let usuarioRoutes = require('./usuarioRoute');
let pagoRoutes = require('./pagoRoute');
let medicoRoutes = require('./medicoRoutes/medicoRoute');
let especialidadRoute  = require('./medicoRoutes/especialidadRoute');
let citaRoute = require('./citaRoute');
let consultaRoute = require('./consultaRoute');
let loginRoute = require('./loginRoute');

/*===================================
Variables
=====================================*/
let APP = express();

/*===================================
RUTAS
=====================================*/
APP.use('/rol', rolRoutes);
APP.use('/persona', usuarioRoutes);
APP.use('/pago', pagoRoutes);
APP.use('/medico', medicoRoutes);
APP.use('/especialidad', especialidadRoute);
APP.use('/cita', citaRoute);
APP.use('/consulta', consultaRoute);
APP.use('/login',loginRoute );

module.exports = APP;

