'use strict';
const bcryptjs = require("bcryptjs");
const db = require('./models/index.js');
const jwt = require('jsonwebtoken');
const env = process.env.NODE_ENV || 'development';
const config = require('../server/config/config.json')[env];

module.exports = {

    list: {
        fetch : {
            before: async (req, res, context) => {
                if (req.query.token) { // auth by token
                    let decodedToken = jwt.verify(req.query.token, config.client_secret);
                    res.status(decodedToken.email === user.email ? 200 : 401).json({ name: user.name, id:user.id });
                    return context.stop;
                } else { //auth by password
                    let user = await db.User.findOne({ where: { email: req.query.email } })
                    let passwordMatched =
                        !!user && await bcryptjs.compare(req.query.password, user.password);
                    res.status(passwordMatched ? 200 : 401).json({ name: user.name, id:user.id });
                    return context.stop;
                } 
           }
        }
    }
}

