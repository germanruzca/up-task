const Usuarios=require('../models/Usuarios');
const enviarEmail=require('../handlers/email');
//const DKIM = require('nodemailer/lib/dkim');

exports.formCrearCuenta=(req,res)=>{
    res.render('crearCuenta',{
        nombrePagina:'Crear cuenta en UpTask'
    })
}

exports.formIniciarSesion=(req,res)=>{
     const {error}=res.locals.mensajes;
    res.render('iniciarSesion',{
        nombrePagina:'Inicia sesion en UpTask',
        error:error
    })
}

exports.crearCuenta= async(req,res) =>{ 

    //Leer los datos
    const {nombre,email,password} = req.body;
    try{
        //Crear el usuario
       await Usuarios.create({
            nombre,
            email,
            password
        });
        //crear una URL de confirmar
        const confirmarUrl=`http://${req.headers.host}/confirmar/${email}`;

        //Crear el objeto de usuario
        const usuario={
            email
        }

        //enviar email
        await enviarEmail.enviar({
            usuario,
            subject:'Confirma tu cuents UpTask',
            confirmarUrl,
            archivo:'confirmar-cuenta'
        });

        //redirigir al usuario
        req.flash('correcto','Enviarmos un correo, confirma tu cuenta')
        res.redirect('/iniciar-sesion')
    }catch(error){
        req.flash('error', error.errors.map(error => error.message));
        res.render('crearCuenta', {
            mensajes: req.flash(),
            nombrePagina : 'Crear Cuenta en Uptask', 
            nombre,
            email,
            password
        })
    }
}   

exports.formReestablecerPassword=(req,res)=>{
    res.render('reestablecer',{
        nombrePagina:'Reestablecer contraseña'
    })
}

// Cambia el estado de una cuenta
exports.confirmarCuenta = async (req, res) => {
    const usuario = await Usuarios.findOne({
        where: {
            email: req.params.correo
        }
    });

    // si no existe el usuario
    if(!usuario) {
        req.flash('error', 'No valido');
        res.redirect('/crear-cuenta');
    }

    usuario.activo = 1; 
    await usuario.save();

    req.flash('correcto', 'Cuenta activada correctamente');
    res.redirect('/iniciar-sesion');
 
}