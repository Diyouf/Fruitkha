const { ObjectId } = require("mongodb")
const mongoose = require("mongoose")

const productSchema = mongoose.Schema({
    productName:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    salePrice:{
        type:Number,
        required:true
    },
    image:{
        type:Array
    },
    category:{
        type:ObjectId,
        required:true,
        ref:"category"
    },
    is_active:{
        type:Boolean
    }
})
module.exports = mongoose.model('Product',productSchema)