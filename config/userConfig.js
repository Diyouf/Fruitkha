require('dotenv').config()
const sessionSecret = process.env.SECRET_KEY_USER;


module.exports = {
    sessionSecret
}