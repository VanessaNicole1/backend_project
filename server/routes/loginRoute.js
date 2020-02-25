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
Google SIGNIN
=====================================*/
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = process.env.CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);
/*===================================
Variables
=====================================*/
const APP = express();
let  { verifyToken } = require('../middlewares/authentication');


/*===================================
Renovar Token
=====================================*/
APP.get('/renuevaToken', verifyToken, (request, response)=>{

    let token = JWT.sign({
        usuario : request.usuario
    }, process.env.SEED, {expiresIn : process.env.EXPIRES});

    let finalUser = {
        user : request.usuario,
        token,
        menu : obtenerMenu(request.usuario.role)
    }

    return helpers.successMessage(response, 200,finalUser) ;
});

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
            token,
            menu : obtenerMenu(CURRENT_ROLE)
        }

        return helpers.successMessage(response, 200, finalUser);
    });
});



/*===================================
Google Authentication
=====================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    
    // const userid = payload['sub'];
  
    return {
        nombre : payload.name,
        email : payload.email,
        image : payload.picture,
        google : true
    } 
    // let googleUser = await verify(token).catch(error => {
    //     return response.status(403).json({
    //         ok : false,
    //         mensaje : "Token no válido",
    //         error
    //     });
    // }) 
  }*/

APP.post('/google', async(request, response) =>{

    let email = request.body.email;
    let nombre = request.body.nombre;
    let foto = request.body.foto;

    Usuario.findOne( {'estado' : true, 'correo' : email}, (error, usuarioEncontrado) =>{

        if(error){
            return helpers.errorMessage(response, 500, "Ocurrió un error al loguearse", error);
        }

        if(usuarioEncontrado){
            let user = {
                role : process.env.USER_ROLE,
                person : usuarioEncontrado
            }

            let token = JWT.sign({
                usuario : user
            }, process.env.SEED, {expiresIn : process.env.EXPIRES});

            let finalUser = {
                message : "YES",
                user,
                token,
                menu : obtenerMenu(process.env.USER_ROLE)
            }

            return helpers.successMessage(response, 200, finalUser);

        }else{
            let usuario = {};
            usuario.nombre = nombre;
            usuario.email = email;
            usuario.foto = foto;
            
            let finalUser = {
                message : "NO",
                usuario
            }
           
            return helpers.successMessage(response, 200, finalUser);
        }
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


function obtenerMenu(rol){
    menu = [
        {
            titulo : 'Principal',
            icono : 'mdi mdi-gauge',
            submenu : [
                { titulo : 'Dashboard', url: '/dashboard'},
                { titulo : 'Progress', url: '/progress'},
                { titulo : 'Graficas', url: '/graficas1'}           
            ]
        },
        {
            titulo : 'Citas',
            icono : 'fa fa-address-book',
            submenu : [
                { titulo : 'Citas Diarias', url: '/citasDiarias'}
            ]
        },
        
        
      
    ];


    if(rol === process.env.USER_ROLE){
        menu[1].submenu.unshift({ titulo : 'Citas', url: '/citas'});
        menu[1].submenu.unshift({ titulo : 'Agendar Cita', url: '/solicitarCita'});
        menu[1].submenu.unshift({ titulo : 'Citas Realizadas', url: '/citasRealizadas'});

        menu.push({
            titulo : 'Consultas',
            icono : 'fa fa-address-book',
            submenu : [
                { titulo : 'Ver Consultas', url: '/verConsultas'}          ]
        });
        
    }

    if(rol === process.env.MED_ROLE){
        menu[1].submenu.unshift({ titulo : 'Citas', url: '/citas'});
        menu[1].submenu.unshift({ titulo : 'Citas Realizadas', url: '/citasRealizadas'});
        menu[2].submenu.unshift({ titulo : 'Ver Consultas', url: '/verConsultas'});
        menu.push({
            titulo : 'Consultas',
            icono : 'fa fa-address-book',
            submenu : [
                { titulo : 'Ver Consultas', url: '/verConsultas'}            ]
        });
        
    }

    if(rol === process.env.ADMIN_ROLE){
        menu.unshift(
            {
                titulo : 'Gestión Hospital',
                icono : 'fa fa-save',
                submenu : [
                    { titulo : 'Pacientes', url: '/usuarios'},
                    { titulo : 'Médicos', url: '/medicos'},
                    { titulo : 'Especialidades', url: '/especialidades'},
                ]
            }
        )
    }

    return menu;
}
module.exports = APP;



