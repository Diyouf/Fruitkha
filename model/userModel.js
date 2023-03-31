const mongoose = require("mongoose")

const addressSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    pincode: {
        type: Number,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true

    },
    landMark: {
        type: String,
        required: true
    }
    ,
    status:{
        type:Boolean,
        
    }
})


const userSchema = mongoose.Schema({
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
    },
    mobile:{
        type:Number,
        required:true
    },
    is_admin:{
        type:Number,
        required:true
    },
    is_varified:{
        type:Number
  
    },
    status:{
        type:Boolean,
        
    },
    address:[addressSchema],
    createdAt:{
        type:Date,
        default:Date.now()
    }
})
module.exports = mongoose.model('User',userSchema)