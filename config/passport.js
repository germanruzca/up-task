   const passport=require('passport');
   const LocalStrategy=require('passport-local').Strategy;

   //Referencia al Modelo donde vamos a autenticar
   const Usuarios=require('../models/Usuarios');

   //Local Strategy-Login con credencales propias (usuario-pasword);
   passport.use(
       new LocalStrategy(
           //por default passport espera un usuario y password;
           {
               usernameField: 'email',
               passwordField: 'password'
           },
           async(email,password,done)=>{
                try{
                    const usuario=await Usuarios.findOne({
                        where:{
                            email:email,
                            activo:1  
                        }
                    })
                    //El usuario Existe pero la password es incorrecto.
                    if(!usuario.verificarPassword(password)){
                        return done(null, false,{
                            message:'Password Incorrecto.'
                        })
                    }
                    //Caso contrario
                    return done(null, usuario);
                }catch(error){
                    //Ese usuario no existe.
                    return done(null,false,{
                        message:'Esa cuenta no existe.'
                    })
                }
           }
       )
   );

   //Serializar el usuario.
passport.serializeUser((usuario,callback)=>{
    callback(null,usuario);
})
   //Deserializar el usuario.
passport.deserializeUser((usuario,callback)=>{
    callback(null,usuario);
})

//Exportar

module.exports=passport;