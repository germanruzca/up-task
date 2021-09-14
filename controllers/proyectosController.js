//const { noExtendLeft } = require('sequelize/types/lib/operators');
const Proyectos=require('../models/Proyecto');
const Tareas =require('../models/Tareas');


exports.proyectosHome=async (req,res)=>{
    //console.log(res.locals.usuario); 
    const usuarioId=res.locals.usuario.id;
    const proyectos = await Proyectos.findAll({
        where:{
            usuarioId:usuarioId
        }
    });
    res.render('index',{
        nombrePagina:'Proyectos'/* + res.locals.year*/,
        proyectos
    });
}

exports.formularioProyecto=async(req,res)=>{
    const usuarioId=res.locals.usuario.id;
    const proyectos = await Proyectos.findAll({
        where:{
            usuarioId:usuarioId
        }
    });
    res.render('nuevoProyecto',{
        nombrePagina:'Nuevo Proyecto',
        proyectos
    })
}

exports.nuevoProyecto= async (req,res)=>{
    const usuarioId=res.locals.usuario.id;
    const proyectos = await Proyectos.findAll({where:{
        usuarioId:usuarioId
    }});
    //Enviar a la consola lo que el usuario envia.
    //console.log(req.body)

    //Validar que exista algo en el formulario

    const {nombre}=req.body;
    let errores=[];
    if(!nombre){
        errores.push({'texto':'Agrega un Nombre al Proyecto'})
    }

    //si hay errores
    if(errores.length>0){
        res.render('nuevoProyecto',{
            nombrePagina:'Nuevo Proyecto',
            errores,
            proyectos
        }) 
    }else{
        
        const usuarioId =res.locals.usuario.id; 
        await Proyectos.create({nombre,usuarioId});
        res.redirect('/');
    }
};

exports.proyectoPorUrl=async (req,res,next)=>{
    const usuarioId=res.locals.usuario.id;
    const proyectosPromise =  Proyectos.findAll({where:{
        usuarioId:usuarioId
    }});

    const proyectoPromise= Proyectos.findOne({
        where:{
            url: req.params.url,
            usuarioId:usuarioId
        }
    });

    const [proyectos, proyecto]= await Promise.all([proyectosPromise,proyectoPromise])

    //Consultar tareas del proyecto actual
    const tareas =await Tareas.findAll({
        where:{
            proyectoId:proyecto.id
        }
        //,
        // include:[
        //     {model: Proyectos}
        // ]
    })
    if(!proyecto) return next();

    res.render('tareas',{
        nombrePagina:'Tareas del Proyecto',
        proyectos,
        proyecto,
        tareas
    })
};

exports.formularioEditar=async (req,res,next)=>{
    const usuarioId=res.locals.usuario.id;
    const proyectosPromise =  Proyectos.findAll({
        where:{
            usuarioId:usuarioId
        }
    });

    const proyectoPromise= Proyectos.findOne({
        where:{
            id: req.params.id,
            usuarioId:usuarioId
        }
    });

    const [proyectos, proyecto]= await Promise.all([proyectosPromise,proyectoPromise])

    
    res.render('nuevoProyecto',{
        nombrePagina:'Editar proyecto',
        proyectos,
        proyecto
    })
};

exports.actualizarProyecto= async (req,res)=>{
    const usuarioId=res.locals.usuario.id;
    const proyectos = await Proyectos.findAll({
        where:{
            usuarioId:usuarioId  
        }
    });
    //Enviar a la consola lo que el usuario envia.
    //console.log(req.body)

    //Validar que exista algo en el formulario

    const {nombre}=req.body;
    let errores=[];
    if(!nombre){
        errores.push({'texto':'Agrega un Nombre al Proyecto'})
    }

    //si hay errores
    if(errores.length>0){
        res.render('nuevoProyecto',{
            nombrePagina:'Nuevo Proyecto',
            errores,
            proyectos
        }) 
    }else{
        
        await Proyectos.update(
            {nombre:nombre},
            {
                where:{
                    id:req.params.id
                }
            }
        
        );
        res.redirect('/');
    }
};


exports.eliminarProyecto=async(req,res,next)=>{
    //Se puede utilizar tanto query como params
    //console.log(req);
    const {urlProyecto} = req.query;
    const nombreP=await Proyectos.findOne({where:{url:urlProyecto}})
    const resultado = await Proyectos.destroy({
        where:{
            url:urlProyecto
        }
    }); 

    if(!resultado){
        return next();
    }
    res.send(`El proyecto "${nombreP.nombre}" se ha eliminado correctamente.`)
}