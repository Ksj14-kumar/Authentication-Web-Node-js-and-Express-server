const express = require('express');
require("dotenv").config()
const port = process.env.PORT || 3201
const app = express()





app.get("/", (req, res) => {
    res.send("<h1>Hello welcome to the heroku</h1>")
})



app.listen(port, (err) => {
    if (err) {
        consolelog("server is not start")
    }
    else {
        console.log("server is start at port" + port)
    }
})