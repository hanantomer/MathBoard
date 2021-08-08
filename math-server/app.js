const express = require('express')
const cors = require('cors')
const Sequelize = require('sequelize')
const finale = require('finale-rest')
const db = require('./src/models/index.js');
const userMiddleware = require('./src/userMiddleware.js');
const bcryptjs = require("bcryptjs");
//const Register = require("./src/register.js").default;

let app = express()
app.use(cors())
app.use(express.json())

//app.post("/register", (req, res) => {
//  let reg = new Register();
//  reg.registerUser(req, res);
//})


finale.initialize({
  app: app,
  sequelize: db.sequelize
})

let userResource = finale.resource({
  model: db.sequelize.models['User'],
  endpoints: ['/users', '/users/:id'],
  // search: {
  //     operator: Sequelize.Op.eq,
  //     param: 'email',
  //     attributes: [ 'email' ]
  //   }
}).use(userMiddleware);

//userResource.list.fetch.before(async (req, res, context) => {
//  
//})

finale.resource({
  model: db.sequelize.models['Exercise'],
  endpoints: ['/exercises', '/exercises/:id']
})

finale.resource({
  model: db.sequelize.models['Symbol'],
  endpoints: ['/symbols', '/symbols/:id']
})

finale.resource({
  model: db.sequelize.models['SignSymbol'],
  endpoints: ['/signsymbols', '/signymbols/:id']
})

finale.resource({
  model: db.sequelize.models['NumberSymbol'],
  endpoints: ['/numbersymbols', '/numbersymbols/:id']
})

// Resets the database and launches the express app on :8081
db.sequelize
  .sync({ force: true })
  .then(() => {
    app.listen(8081, () => {
      console.log('listening to port localhost:8081')
  })
 })