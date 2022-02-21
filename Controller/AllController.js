const jwt = require('jsonwebtoken');
const Post = require('../db/model');
const bcrypt = require('bcrypt');
const express = require('express');
const Dpost = require('../db/data');
const fs = require("fs")
const Mail = require('../Mail/Email')

const app = express()
const authentication = require('../middleware/auth');
const navigator = require('../Navigator/navigator');
require("dotenv").config()

let logoutLogin = false



const KEY = process.env.SECKRET_KEY






exports.view = async (req, res, next) => {
    try {
        const data = await Post.find()
        // res.render("home")
        // res.end()
        res.json(data)
    }
    catch (err) {
        res.send({ message: "Give something error" + err.name })
    }
}
exports.welcome = async (req, res) => {
    res.render("welcome")
}







exports.register = async (req, res) => {
    const errorsArray = []


    try {
        console.log(req.body);
        const { name, email, password, cpassword
        } = req.body;





        //check some field is empty or not
        if (!name || !email || !password || !cpassword) {
            errorsArray.push({ message: "All field are required" })

        }

        function isEmailValid(email) {
            const pattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
            return pattern.test(email)
        }

        if (isEmailValid(email)) {
            errorsArray.push({ mesage: "Invalid Email" })
        }

        if (password != cpassword) {
            errorsArray.push({ message: "Password must be same" })
            return res.render("registerdata", {
                errorsArray,
                name,
                email,
                password,
                cpassword
            })
        }
        if (password.length < 6 || cpassword.length < 6) {
            errorsArray.push({ message: "Password must be greater than 6 letter" })
            return res.render("registerdata", {
                errorsArray,
                name,
                email,
                password,
                cpassword
            })
        }

        Post.findOne({ email: email }, async (err, userInfo) => {
            if (userInfo) {
                errorsArray.push({ message: "User already register with this email" })
                res.render("registerdata", {
                    errorsArray,
                    name,
                    email,
                    password,
                    cpassword
                })
            }


            else {

                const SaveUserData = new Post({
                    name: name.trim(),
                    email: email.trim(),
                    password: await bcrypt.hash(password, 10),
                    cpassword: await bcrypt.hash(cpassword, 10)
                    // await bcrypt.hash(password, 10)
                    // await bcrypt.hash(cpassword, 10)

                })

                const token = jwt.sign({ email: email }, KEY, { expiresIn: 900000 })
                SaveUserData.token = token
                SaveUserData.verify = false
                SaveUserData.save((err) => {
                    if (err) {
                        return res.status(401).render("registerdata", { error_msg: "Something error" })
                    }
                    else {
                        req.flash("success_msg", "Successful singup, Verify your Email, Email has been send to your mail")
                        Mail(token, email, "mail", "pelase click this link to verify your mail", "Verify Email")
                        res.status(200).cookie("jwttoken", token).redirect("/singup")
                    }
                })

            }

        })



    }
    catch (err) {
        req.flash("error", "Something error, try again")
        res.status(403).redirect("/singup")
    }

}



exports.login = async (req, res) => {
    const errorsArray = []

    console.log(req.body)
    try {
        const { email, password } = req.body
        if (!email || !password) {
            errorsArray.push({ message: "All field are required" })
            return res.render("login", {
                errorsArray,
                email,
                password
            })


        }

        const loginDetails = await Post.find({ email: email })
        if (loginDetails.length < 1) {
            errorsArray.push({ message: "invalid credential" })
            return res.render("login", {
                errorsArray,
                email,
                password
            })


        }
        else {

            //bcrypt.comoare(USERPASSWORD, HASHPASSWORD)

            bcrypt.compare(password, loginDetails[0].password, async (err, result) => {
                if (err) {
                    req.flash("error_msg", "invalid credentials")
                    res.redirect("/singin")

                }


                if (result) {
                    // let logoutLogin = false

                    var jwttoken = jwt.sign({ email: loginDetails[0].email }, KEY)
                    res.cookie("jwttoken", jwttoken, { maxAge: 300000 })
                    if (loginDetails[0].verify) {
                        if (req.cookies.jwttoken) {
                            // logoutLogin = true

                            loginDetails[0].token = jwttoken
                            res.render("home", { logoutLogin: true })
                        }
                        else {
                            res.render("home", { logoutLogin: true })


                        }


                        // res.cookie("jwttoken", jwttoken).redirect("/home")
                    }
                    else {
                        res.render("login", { error_msg: "please verify email for login" })


                    }


                }
                else {
                    req.flash("error_msg", "invalid credentials")
                    res.status(401).redirect("/singin")
                }
            })

        }
    }
    catch (err) {
        req.flash("error", "Something went wrong")
        res.render("login")
    }


}


exports.getById = async (req, res) => {
    try {

        const data = await Post.findById({ _id: req.params.id })
        if (!data) {
            res.json({ message: "id not exit" })
        }
        else {
            res.json(data)
        }

    }
    catch (err) {
        res.json({ message: "something cast error occur error " + err.name })

    }
}


exports.deleteById = async (req, res) => {
    try {
        const id = req.params.id
        if (!id) {
            res.json({ message: "please fill Id" })
        }


        await Post.findByIdAndRemove({ _id: id })
        res.json({ message: "successfull delete" })
    }
    catch (err) {
        res.json({ message: "can't not delete" })
    }
}


exports.contact = async (req, res) => {
    const { name1, email } = req.userData
    try {
        console.log(email);
        console.log(Dpost.findOne({ email: email }));






        const { name, address, mobile, website } = await Dpost.findOne({ email: email })
        res.render("contact", { name: name.toUpperCase(), email: email, address: address, mobile: mobile, website: "www.Profiler.Com" })

    } catch (error) {
        req.flash("success_msg", "Kindly Create your profile")

        res.status(403).render("contactEmpty")

    }

}
exports.service = async (req, res) => {
    res.render("service")
}

exports.about = async (req, res) => {
    try {
        console.log("user info", req.userData)
        console.log("tokenabout", req.token)
        const { name, email, ...otherData } = req.userData
        const aboutData = await Dpost.findOne({ email: email })
        console.log(aboutData.about);

        res.render("about", { about: aboutData.about })


    } catch (err) {
        res.status(403).render("emptyAbout")
        // json({ message: "Sorry Data Not Exit, 1st create Profile" })

    }


}

exports.home = async (req, res) => {
    res.status(200).clearCookie("jwttoken").render("home", { logoutLogin: logoutLogin })
}

exports.singup = async (req, res) => {
    res.status(200).render("registerdata")
}


exports.lost = async (req, res) => {
    res.status(200).render("lost")
}

exports.unautherized = async (req, res) => {
    res.status(200).render("unautherized")
}
exports.singin = async (req, res) => {
    // console.log("successfull login");
    if (req.cookies.jwttoken) {


        res.status(200).render("login", { logoutLogin: true })
    }
    else {
        res.render("login", { logoutLogin: true })
    }

}

exports.logout = async (req, res) => {
    res.clearCookie("jwttoken").render("home", { logoutLogin: logoutLogin })
}

exports.FirstPage = async (req, res) => {
    res.render("PageOut")

}

exports.SecondPage = async (req, res) => {
    res.render("PageOut")

}
exports.profile = async (req, res) => {
    res.render("profile")

}

exports.uploaddata = async (req, res) => {


    try {
        console.log("update data", req.body);
        const { name, gender, birth, address, state, city, pincode, phone, mobile, about, file } = req.body

        console.log("updated data", req.body);
        const image = req.file.filename
        // console.log("file data", req.file)
        console.log("images", image);
        const { name1, email, ...otherData } = req.userData

        // console.log("body data", req.body)

        const info = await new Dpost({
            name: name,
            email: email,
            gender: gender,
            dob: birth,
            address: address,
            // nationality: nationality,
            state: state, city: city,
            pincode: pincode,
            phone: phone,
            mobile: mobile,
            about: about,
            image: image
        })
        console.log(req.token);
        console.log("userdata", req.userData);

        console.log("info data", info)



        info.token = req.userData.token

        // Post.find({})
        // console.log(authentication)



        info.save((err, result) => {
            console.log("error name is ", err);

            if (err) {
                res.json({ message: "information not save" + err.name })
            }
            else {
                res.json({ message: "information  saved" })
            }
        })

    }
    catch (err) {
        res.json({ message: "give Something error" + err.name })
    }




}

exports.view_profile = async (req, res) => {

    try {
        console.log("console window");
        // console.log("file data", req.file.filename)

        const { email } = req.userData
        const dataForProfile = await Dpost.findOne({ email: email })
        console.log("data", "../photos/1.jpg");

        console.log("data for", dataForProfile.name);
        console.log("data for", dataForProfile);
        console.log("data for", dataForProfile.image);

        res.render("view_profile",
            {
                image: `./${dataForProfile.image}`,
                name: dataForProfile.name.toUpperCase(),
                gender: dataForProfile.gender.toUpperCase(),
                date: dataForProfile.dob,
                address: dataForProfile.address.toUpperCase(),
                state: dataForProfile.state.toUpperCase(),
                city: dataForProfile.city.toUpperCase(),
                pincode: dataForProfile.pincode.toUpperCase(),
                phone: dataForProfile.phone.toUpperCase(),
                mobile: dataForProfile.mobile,
                about: dataForProfile.about.toUpperCase()
            }
        )

    }
    catch (err) {
        if (err) {

            req.flash("success_msg", "Kindly create your profile")
            res.status(201).render("view_profileEmpty")
        }
        else {
            res.json({ message: "Successful" })

        }
    }


}


exports.update = async (req, res) => {
    try {

        // , { name: req.body.name, gender: req.body.gender, dob: req.body.birth, address: req.body.address, state: req.body.state, city: req.body.city, pincode: req.body.pincode, phone: req.body.phone, mobile: req.body.mobile }



        const { email } = req.userData
        console.log(req.userData)
        console.log(req.body)
        console.log("upload data", req.body)
        const userDataUpdate = await Dpost.findByIdAndUpdate({ email: email })
        console.log(userDataUpdate)

        userDataUpdate.save((err) => {
            if (err) {
                res.json({ message: "Update not save" + err })
            }
            else {
                res.json({ message: "update successful" })
                res.redirect("/")
            }
        })


    }
    catch (err) {
        res.json({ message: "can not update" })

    }

}