const { ObjectId } = require("mongodb")
const mongoose = require("mongoose")

const productSchema = mongoose.Schema({
    productId:{
        type:ObjectId,
        ref:'Product'       
    },
    quantity:{
        type:Number,
        require:true
    },
    total:{
        type:Number,
        required:true
    }
    
})
const cartScheama = mongoose.Schema({
    userData:{
        type:ObjectId,
        require:true
    },
    
    products:[productSchema],

    coupon:{
        type:ObjectId
    }
    
})
module.exports = mongoose.model('cart',cartScheama)