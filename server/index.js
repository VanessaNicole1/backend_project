/*===================================
Global Congiguration
=====================================*/
require('./config/config');

/*===================================
Libraries
=====================================*/
let body_parser = require('body-parser');
let express =  require('express');
let mongoose = require('mongoose');

/*===================================
Variables
=====================================*/
const APP = express();

/*===================================
Cors
=====================================*/
APP.use(function(req, res, next) {
    res.header("Access-Control-Allow-Credentials",  true)
    res.header("Access-Control-Allow-Origin", req.headers.origin); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});


APP.use(body_parser.urlencoded({extended : false}));
APP.use(body_parser.json());

/*===================================
Conection to MongoDB
=====================================*/
mongoose.set('runValidators', true);
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

APP.use(require('./routes/index'));

/*===================================
Montar el servidor
=====================================*/
APP.listen(process.env.PORT, () => {
    console.log(`Estamos corriendo NODE en el puerto: ${process.env.PORT}`);
});