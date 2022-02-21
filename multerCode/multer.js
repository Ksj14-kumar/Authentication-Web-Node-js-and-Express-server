const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./photos")
    },
    filename: function (req, file, cb) {
        const fileWithdate = file.originalname
        cb(null, fileWithdate)
        // file.fieldname + '-' + 
    }
})


module.exports = multer({ storage: storage })

