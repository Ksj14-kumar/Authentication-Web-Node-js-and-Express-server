const jwt = require("jsonwebtoken");
const google = require("../db/google");
const Post = require("../db/model");
require('dotenv').config();
let logoutLogin = false
// , "token": userToken }
const KEY = process.env.SECKRET_KEY
var authentication = async (req, res, next) => {
    try {
        const userToken = req.cookies.jwttoken
        console.log("user token", userToken)
        const verifyToken = await jwt.verify(userToken, KEY)
        console.log("verifytoken", verifyToken)
        const VerifyUser = await Post.findOne({ email: verifyToken.email }) || await google.findOne({ email: verifyToken.email })
        console.log("verigy user", VerifyUser)
        console.log("verify token", verifyToken);
        if (!VerifyUser) {
            console.log("user not verify")
            res.redirect("/home")
            // res.json({ message: "user not verify" })

        }
        if (userToken) {
            logoutLogin = true

            req.token = userToken
            req.userData = VerifyUser
        }
        else {
        }
        next()
    }
    catch (err) {
        res.status(401).redirect("/unautherized")

    }

}

module.exports = authentication


