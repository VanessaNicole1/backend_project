/*Establecer puerto de Node mediante el archivo config*/
require('./config/config');
/*Server Express*/
let express =  require('express');
/*Mongoose for Manipulate MONGODB*/
let mongoose = require('mongoose');
/*Body-Parser*/
let body_parser = require('body-parser');
/*Importar Rutas*/
let rolRoutes = require('./routes/rolRoute');
let usuarioRoutes = require('./routes/usuarioRoute');
let pagoRoutes = require('./routes/pagoRoute');
let medicoRoutes = require('./routes/medicoRoutes/medicoRoute');
let especialidadRoute  = require('./routes/medicoRoutes/especialidadRoute');

let app = express();

app.use(body_parser.urlencoded({extended : false}));
app.use(body_parser.json());

/*===================================
Conection to MongoDB
=====================================*/
mongoose.connect('mongodb://localhost:27017/hospital', 
                {
                    useFindAndModify : false,
                    useCreateIndex : true,
                    useNewUrlParser : true
                },
                (error, correctly) =>{
    
    if(error) throw error;
    console.log("BD online");
});

/*===================================
RUTAS
=====================================*/
app.use('/rol', rolRoutes);
app.use('/persona', usuarioRoutes);
app.use('/pago', pagoRoutes);
app.use('/medico', medicoRoutes);
app.use('/especialidad', especialidadRoute);

/*===================================
Montar el servidor
=====================================*/
app.listen(process.env.PORT, () => {
    console.log(`Estamos corriendo NODE en el puerto: ${process.env.PORT}`);
});