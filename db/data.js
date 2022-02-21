const app = require('express')();
const mongoose = require('mongoose');

const Schema1 = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    gender: {
        type: String,
        required: true,
        trim: true
    },
    email: { type: String, required: true, trim: true },
    dob: { type: String, trim: true, required: true, },
    address: {
        type: String,
        required: true,
        trim: true

    },

    state: {
        type: String,
        required: true,
        trim: true

    },
    city: {
        type: String,
        required: true,
        trim: true

    },
    pincode: {
        type: String,
        required: true,
        trim: true

    },
    phone: {
        type: String,
        required: true,
        trim: true

    },
    mobile: {
        type: String,
        required: true,
        trim: true

    },
    about: {
        type: String,
        required: true,
        trim: true

    }

})

Schema1.add({
    image: {
        type: String,
        required: true,
        trim: true
    }
})

Schema1.add({
    date: { type: String, default: Date.now() }
})
Schema1.add({
    token: {
        type: String,
        required: true,
        trim: true
    }
})

const Dmodel = mongoose.model("AllInfo", Schema1)
// Dmodel.save()
module.exports = Dmodel

// Dmodel.insertMany([{
//     name: 'sanju',
//     gender: 'male',
//     dob: '01/01/2001',
//     address: 'Agra,India',
//     nationlity: 'India',
//     state: 'UP',
//     city: 'Agra',
//     pincode: '283125',
//     phone: '9149077008',
//     mobile: '7088523838',
//     about: 'i am sanju'
// }])




