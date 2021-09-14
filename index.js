const express = require('express');
const routes =require('./routes')
const path = require('path');
const bodyParser = require('body-parser');
const expressValidator=require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport=require('./config/passport');
//importtar las variables 

//Crear la conexion de la base de datos
const db=require('./config/db')
//helpers con algunas funciones
const helpers =require('./helpers');

//Importar el modelo
require('./models/Proyecto')
require('./models/Tareas')
require('./models/Usuarios')


db.sync()
    .then(()=>console.log('Conectado al Servidor'))
    .catch(error=>console.log(error));

//crear app de express
const app=express();

//Donde cargar los archivos estaticos.
app.use(express.static('public'))

//Habiltaer pug
app.set('view engine','pug')


//Habilitar bodyParser para leer datos del formulario.
app.use(bodyParser.urlencoded({extended: true}));

//Añadir la carpeta de las vistas
app.set('views',path.join(__dirname, './views'));


//agregar flash messages
app.use(flash());


app.use(cookieParser());

// sessiones nos permiten navegar entre distintas paginas sin volvernos a autenticar
app.use(session({ 
    secret: "supersecreto", 
    resave: false, 
    saveUninitialized: false 
}));

app.use(passport.initialize());
app.use(passport.session());



//Pasar var dump a la aplicaciuon

app.use((req,res,next)=>{
    res.locals.vardump=helpers.vardump;
    res.locals.mensajes=req.flash();
    res.locals.usuario={...req.user} || null;
    console.log(res.locals.usuario);
    next();
});



app.use('/', routes())

//Servidor y puerto

const host=process.env.HOST || '0.0.0.0';
const port=process.env.PORT || 3000

app.listen(port,host,()=>{
    console.log(`El servidor esta funcionando= ${process.env.HOST}:${process.env.PORT}`);
});