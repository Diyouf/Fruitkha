const mongoose = require("mongoose")

const productSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }

   
})
module.exports = mongoose.model('Admin',productSchema)
