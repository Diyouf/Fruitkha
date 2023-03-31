require('dotenv').config()
const adminsessionSecret = process.env.SECRET_KEY_ADMIN;



module.exports = {
    adminsessionSecret
}