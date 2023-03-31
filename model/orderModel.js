const { ObjectId } = require("mongodb")
const mongoose = require("mongoose")

const orderDetails = mongoose.Schema({
    productId: {
        type: ObjectId,
        ref: 'Product'
    },
    quantity: {
        type: Number,
        require: true
    },
    total: {
        type: Number,
        required: true
    }

})
const orderSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        required: false,
        ref:'User'
    },
    productData: [orderDetails],

    peymentMethod: {
        type: String,
        required: true
    },
    addressId: {
        type: ObjectId,
        required: true,
        
    },
    date:{
        type:Date,
        default:Date.now
    },
    cartTotal:{
        type:Number,
        required:true
    },
    dicountTotal:{
        type:Number,
        
    },
    status:{
        type:String,
        required:true
    },
    paymentStatus:{
        type:String,
        required:true,
    },
    couponCode:{
        type:String,
    },
    couponDiscount:{
        type:Number
    }

})
module.exports = mongoose.model('Order', orderSchema)