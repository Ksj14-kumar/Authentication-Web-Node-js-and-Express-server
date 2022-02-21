const jwt = require("jsonwebtoken")
const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20")
const GoogleDatabase = require("../db/google")
const Post = require("../db/model")
const KEY = process.env.SECKRET_KEY

passport.serializeUser((user, done) => {
    done(null, user.id)
})


passport.deserializeUser((id, done) => {
    GoogleDatabase.findById(id, (err, user) => {
        if (err) {
            return done(null, false, { message: "invalid data" })
        }
        else {
            return done(null, id)
        }
    })
})

module.exports = function (req, res) {
    passport.use(new GoogleStrategy({
        callbackURL: "/google/auth",
        clientID: process.env.clientid,
        clientSecret: process.env.clientSecret
    }, (accessToken, refreshToken, profile, done) => {
        // console.log(profile)
        GoogleDatabase.findOne({ googleID: profile.id }, (err, currentUser) => {
            if (err) {
                return done(null, false, { message: "Something error" })
            }
            if (currentUser) {

                return done(null, currentUser)
            }
            else {
                const jwttoken = jwt.sign({ email: profile.emails[0].value }, KEY)
                // res.cookie("jwttoken", jwttoken)

                new GoogleDatabase({
                    name: profile.displayName,
                    googleID: profile.id,
                    email: profile.emails[0].value,
                    token: jwttoken
                }).save((err, result) => {
                    if (err) {
                        return done(null, false, { message: "user not save please try again" })
                    }
                    else {
                        return done(null, result)
                    }
                })
            }
        })
    }))


}
