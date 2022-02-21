const nodemail = require('nodemailer');




module.exports = function (token, email, route,message,message2) {


    const transporter = nodemail.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    const mailOptions = {
        from: process.env.EMAIL,
        to: `${email}`,
        subject: `${message2}`,
        text:`${message2}`,
        html: `<p> ${message}
        <a href="http://localhost:3501/${route}/${token}">Click here</a></p>`
    }

    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            console.log("email is not send to the client" + err)
        }
        else {

            console.log("mail send to the client")
        }
    })
}