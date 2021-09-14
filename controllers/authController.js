const passport=require('passport');
const Usuarios=require('../models/Usuarios')
const Sequelize=require('sequelize');
const Op = Sequelize.Op
const crypto=require('crypto'); 
const { ids } = require('webpack');
const bcrypt=require('bcrypt-nodejs'); 
const enviarEmail=require('../handlers/email');

exports.autenticarUsuario= passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/iniciar-sesion',
    failureFlash:true,
    badRequestMessage:'Ambos campos son obligatorios'
});


//Funcion para ver si el usuario esta autenticado o no.
exports.usuarioAutenticado=(req,res,next)=>{
    //Si el usuario esta autentidcado, adelante.
    if(req.isAuthenticated()){
        return next();
    }

    //Si el usuario no esya autenticado, mandar al iniciar sesion
    return res.redirect('/iniciar-sesion')
}

//Funcion para cerrar sesion
exports.cerrarSesion=(req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/iniciar-sesion')//cerrar sesion y nos lleva a la pgina de iniciar sesion.
    })
}

//Genera un token si el suuario es valido.

exports.enviarToken=async (req,res)=>{
    //Verificar que el susuario exista
    const {email}=req.body
    const usuario=await Usuarios.findOne({
        where:{
            email:email
        }
    });

    if(!usuario){
        req.flash('error','No existe esa cuenta');
        res.render('/reestablecer');
    }
    //Si si existen:
    usuario.token=crypto.randomBytes(20).toString('hex')
    usuario.expiracion=Date.now()+3600000;

    await usuario.save();

    //url de rest
    const resetUrl=`http://${req.headers.host}/reestablecer/${usuario.token}`;
    console.log(resetUrl);

    //Envia el correo con el token
    await enviarEmail.enviar({
        usuario,
        subject:'Password Reset',
        resetUrl,
        archivo:'reestablecer-password'
    });

    req.flash('correcto','Se envió un mensaje a tu correo');
    res.redirect('/iniciar-sesion');
}

exports.validarToken=async (req,res)=>{
    const usuario=await Usuarios.findOne({
        where:{
            token:req.params.token
        }
    })
    if(!usuario){
        req.flash('error','No valido')
        res.redirect('/reestablecer')
    }

    res.render('resetPassword',{
        nombrePagina:'Reestablecer Contraseña'
    })
}

//Camnbia el password por uno nuevo 

exports.actualizarPassword=async(req,res)=>{
    const usuario=await Usuarios.findOne({
        where:{
            token:req.params.token,
            expiracion:{
                [Op.gte]:Date.now()
            }
        }
    }); 
    if(!usuario){
        req.flash('error','No valido');
        res.redirect('/reestablecer');
    }

    usuario.password=bcrypt.hashSync(req.body.password,bcrypt.genSaltSync(10));
    usuario.token=null;
    usuario.expiracion=null;

    // Se guarda la nueva contraseña 

    await usuario.save();


    req.flash('Correcto','Tu password se ha modificado correctamente')
    res.redirect('/iniciar-sesion');
    
}