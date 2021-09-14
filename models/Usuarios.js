const Sequelize = require('sequelize');
const db = require('../config/db');
const Proyectos = require('../models/Proyecto')
const bcrypt=require('bcrypt-nodejs');

const Usuarios=db.define('usuarios',{
    id:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    nombre:{
        type: Sequelize.STRING,
        allowNull:false,
        validate:{
            notEmpty:{
                msg:"El nombre no puede ir vacio."
            }
        }
    },
    email:{
        type:Sequelize.STRING,
        allowNull:false,
        validate:{
            isEmail:{
                msg:"Agrega un Correo Valido"
            },
            notEmpty:{
                msg:"El E-mail no puede estar vacio."
            }
        },
        unique:{
            args:true,
            msg:"Usuario ya existente."
        }
    },
    password:{
        type:Sequelize.STRING(60),
        allowNull:false,
        validate:{
            notEmpty:{
                msg: "La contraseña no puede estar vacia."
            }
        }
    },
    activo:{
        type:Sequelize.INTEGER,
        defaultValue:0
    },
    token: Sequelize.STRING,
    expiracion:Sequelize.DATE
},{
    hooks:{
        beforeCreate(usuario){
            usuario.password=bcrypt.hashSync(usuario.password,bcrypt.genSaltSync(10));
        }
    }
});
//Metodos personalizados
Usuarios.prototype.verificarPassword=function(password){
    return bcrypt.compareSync(password,this.password);
}

Usuarios.hasMany(Proyectos);


module.exports=Usuarios;