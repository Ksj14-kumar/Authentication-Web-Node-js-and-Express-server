const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    name: { type: String, required: true },
    googleID: { type: String, required: true },
    email: { type: String, required: true },
    token: { type: String, required: true }
})









module.exports = mongoose.model("google", Schema)