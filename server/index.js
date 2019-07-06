/*Establecer puerto de Node mediante el archivo config*/
require('./config/config');
/*Server Express*/
let express =  require('express');
/*Mongoose for Manipulate MONGODB*/
let mongoose = require('mongoose');
/*Body-Parser*/
let body_parser = require('body-parser');

let app = express();

app.use(body_parser.urlencoded({extended : false}));
app.use(body_parser.json());

/*===================================
Conection to MongoDB
=====================================*/
mongoose.connect('mongodb://localhost:27017/hospitalAdvance', 
                {
                    useFindAndModify : false,
                    useCreateIndex : true,
                    useNewUrlParser : true
                },
                (error, correctly) =>{
    
    if(error) throw error;
    console.log("BD online");
});

app.listen(process.env.PORT, () => {
    console.log(`Estamos corriendo NODE en el puerto: ${process.env.PORT}`);
});