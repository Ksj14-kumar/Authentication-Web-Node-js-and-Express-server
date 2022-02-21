const express = require('express');
const app = express()
const bcrypt = require('bcrypt');

const router = express.Router()
// const multer = require('multer');
const authentication = require('../middleware/auth');
const header = require('../Controller/AllController');
const multer = require('../multerCode/multer');
const jwt = require('jsonwebtoken');
const Post = require("../db/model");
const passport = require('passport');
const Passport = require('../Controller/Passport');
const GoogleDatabase = require("../db/google");
const Mail = require("../Mail/Email");
const KEY = process.env.SECKRET_KEY
let logoutLogin = false




function setCookie(req, res, next) {
    try {

        const { email, token } = req.user
        res.cookie("jwttoken", token)
        console.log("cookie set successful")




    } catch (err) {
        res.json({ message: "not set" })

    }
    next()

}

//routing start





router.get("/allprofiles", header.view)
router.get("/", header.home)

router.post("/register", header.register)
router.post("/login", header.login)
router.delete("/:id", header.deleteById)
router.get("/get/:id", header.getById)


console.log("authentication", authentication)




//authentication router
router.get("/welcome", authentication, header.welcome)
router.get("/service", authentication, header.service)
router.get("/contact", authentication, header.contact)
router.get("/about", authentication, header.about)
router.get("/profile", authentication, header.profile)
router.get("/view_profile", authentication, header.view_profile)
router.post("/update", authentication, header.update)
router.post("/uploaddata", authentication, multer.single("file"), header.uploaddata)


//singup and singin  router
router.get("/singup", header.singup)
router.get("/lost", header.lost)
router.get("/singin", header.singin)
router.get("/unautherized", header.unautherized)
router.get("/logout", header.logout)

router.get("/mail/:tokens", async (req, res) => {
    try {
        const token = req.params.tokens
        const getUserMail = jwt.verify(token, KEY)

        const result = await Post.findOne({ email: getUserMail.email })

        result.verify = true
        await Post.findByIdAndUpdate({ _id: result.id }, result)

        if (result.verify) {
            req.flash("success_msg", "Email Verify successfull, now login")
            return res.redirect("/singin")
        }

        else {
            req.flash("error_msg", "Please, verify your email")
            res.redirect("/login")

        }

    } catch (err) {
        req.flash("error_msg", "email not verify please verify email")
        return res.redirect("/login")

    }

})

//GOOGLE ROUTE
router.get("/google/login", passport.authenticate("google", { scope: ["profile", "email"] }))


router.get("/google/auth", [passport.authenticate("google"), setCookie], (req, res) => {

    try {
        // console.log(req.user)

        console.log("cookie")
        console.log(req.cookies.jwttoken)

    } catch (err) {
        res.json({ message: "something error" })


    }

})



router.get("/updatepassword", (req, res) => {
    try {

        res.status(200).render("changePassword")


    } catch (err) {
        req.flash("error_msg", "Something went wrong")
        res.redirect("/singin")

    }
})

router.post("/updatepass", async (req, res) => {
    try {
        const { email } = req.body
        console.log(email)
        const isEmailExitDataBase = await Post.findOne({ email: email })

        console.log(isEmailExitDataBase)
        if (!email) {
            req.flash("error_msg", "Enter Email")
            return res.redirect("/updatepassword")
        }

        else if (isEmailExitDataBase) {

            const token = jwt.sign({ email: email, id: isEmailExitDataBase.id }, KEY, { expiresIn: "300000" })
            console.log(token)
            Mail(token, email, "passwordpage", "change password, click here ☻☻☻☻", "Change Password")
            req.flash("success_msg", "Email successful send")
            return res.status(200).redirect("/updatepassword")
        }


        else {
            req.flash("error_msg", "Email not exit in our Database, please singup")
            return res.status(402).redirect("/updatepassword")

        }


    } catch (err) {
        req.flash("error_msg", "Email not send please, try again")
        res.status(401).redirect("/updatepassword")

    }
})


router.get("/passwordpage/:token", async (req, res) => {
    try {
        const token = req.params.token
        const verfiyEmail = await jwt.verify(token, KEY)

        const UserFind = await Post.findOne({ email: verfiyEmail.email })
        if (UserFind) {

            res.status(200).cookie("id", verfiyEmail.id).render("password")
        }
        else {
            req.flash("error_msg", "Email not belongs to our database")
            return res.redirect("/updatepassword")

        }


    } catch (err) {
        req.flash("error_msg", " try again")
        res.status(401).redirect("/passwordpage")

    }
})

router.post("/change", async (req, res) => {
    try {
        const { password, cpassword } = req.body
        console.log(req.body)
        if (!password || !cpassword) {
            req.flash("error_msg", "All fields are required for change password")
            res.render("password")
        }
        else if (password !== cpassword) {
            req.flash("error_msg", "password must be same")
            res.render("password")

        }
        else {
            const id = req.cookies.id
            console.log(id)


            const userDetailsFetch = await Post.findByIdAndUpdate({ _id: id }, { $set: { password: await bcrypt.hash(password, 10), cpassword: await bcrypt.hash(cpassword, 10) } })
            // , { $and: { $set: [{ password: password }, { cpassword: cpassword }] } }
            console.log(userDetailsFetch)
            console.log("successful update")
            req.flash("success_msg", "password successful reset, now login")
            return res.status(200).redirect("/singin")
        }



    } catch (err) {
        req.flash("error_msg", " try again")
        return res.status(401).redirect("/change")

    }
})


// DELELTYE USER ACCOUNT

router.get("/delete", authentication, async (req, res) => {
    try {
        // console.log(req.userData)
        const { id } = req.userData
        console.log("delete  consbfjkdhf")
        Post.findByIdAndDelete(id, (err, result) => {

            console.log(result)
            if (result) {


                req.flash("delete1", "successful delete")
                return res.clearCookie("jwttoken").redirect("/")
            } else {
                req.flash("error", "Something error")
                res.redirect("/")
            }
        })


        // res.json({mesage:req.userData})

    } catch (err) {
        req.flash("error", "Something error")
        res.redirect("/")

    }
})


//inavlid router

router.get("/*", header.FirstPage)
router.get("/*/*", header.SecondPage)







module.exports = router;