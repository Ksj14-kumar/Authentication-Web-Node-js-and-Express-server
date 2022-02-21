const mongoose = require('mongoose');
require("dotenv").config()
// const Key = process.env.SECKRET_KEY


const Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3

    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    }

})

Schema.add({
    password: {
        type: String,
        required: true

    },
    cpassword: { type: String, required: true, trim: true }

})

Schema.add({
    token: { type: String, required: true }
})


Schema.add({
    verify: { type: Boolean, required: true }
})

Schema.add({
    date: { type: Date, default:Date.now() }
})

const model = mongoose.model("registration", Schema)

module.exports = model;



