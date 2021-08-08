import { hashSync } from "bcryptjs";
const Sequelize = require('sequelize')

class Register {
    registerUser(req, res) {
        let encryptedPasswword = hashSync(req.body.password, 8);
    }
}
    
export default Register
