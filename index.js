const express = require('express');
const fs = require('fs');
const utl = require("util")
const app = express()
const mongoose = require('mongoose');
const router = require('./router/router');
const cors = require('cors');
require("dotenv").config()
const KEY = process.env.SECKRET_KEY
const passport = require("passport")

app.set("view engine", "ejs")
const bodyParser = require("body-parser")
const method = require("method-override")
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
require("./Controller/Passport")()
app.use(cookieParser())

// app.use(express.static("upload"))
app.use(express.static(__dirname + "/photos"))


//build in  middle ware, for parsing the data

app.use(bodyParser.json())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(session({
    secret: KEY,
    resave: true,
    saveUninitialized: true
}))
app.use(method("_method"))
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

const port = process.env.PORT || 3500
const url = process.env.MONGO_URI || "mongodb://localhost:27017/MyDb"



//creating the flash messages
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.delete1 = req.flash("delete1")
    next()
})

mongoose.connect(url, (err, result) => {
    if (err) {
        console.log("not connected..")
    }
    else {
        console.log("successfull connected")
    }
})












app.get("/", (req, res) => {
    res.send("<h1>Hello welcome to the heroku</h1>")
})




console.log = function (d) {
    fs.createWriteStream(__dirname + "/log.log", { flags: "a" }).write(utl.format(d) + "\n")
    process.stdout.write(utl.format(d) + "\n")

}


app.listen(port, (err) => {
    if (err) {
        consolelog("server is not start")
    }
    else {
        console.log("server is start at port" + port)
    }
})