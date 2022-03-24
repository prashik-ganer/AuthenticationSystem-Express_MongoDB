const async = require("hbs/lib/async")
const jwt = require("jsonwebtoken")
const Register = require("../models/registers")

// req, res --> objects || next --> keyword
const auth = async(req, res, next)=>{
    try {
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, "thisisthesecretkeywhichshouldbeatleastXXXIIbitslong")
        console.log(verifyUser)
        // To get logged in user data
        const user = await Register.findOne({_id: verifyUser._id})
        console.log(user)
        console.log(user.firstname)

        // For logout
        // req.token --> used to get token value
        req.token = token
        req.user = user


        next();

    } catch (error) {
        res.status(401).send(error);
    }
}

// Very important -- To use 'auth' functionality in different files
module.exports = auth;