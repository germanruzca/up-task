const { Sequelize } = require('sequelize');

require('dotenv').config({path:'variables.env'})
const db = new Sequelize('heroku_fc1429060ac9070', 'b5410809479d1a', 'da262d6c', {
  host: 'us-cdbr-east-04.cleardb.com',
  dialect: 'mysql',
  port:3306, 
  define:{
      timestamps:false
  },
  pool:{
      max:5,
      min:0,
      acquire: 30000,
      idle:10000
  }
});


module.exports=db;