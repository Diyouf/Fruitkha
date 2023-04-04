const { ObjectId } = require("mongodb")
const mongoose = require("mongoose")


const couponSchema = new mongoose.Schema({
    coupon:{
        type: String,
        required: true
    },
    userId: {
        type: Array,   
    },
    couponType:{
        type: String,
        required: true
    },
    orderId: {
        type: ObjectId,
        ref:'Order'
    },
    createdDate:{
        type:Date,
        default:Date.now
    },
    ExpiryDate:{
        type:Date,
        required:true
    },
    minPrice:{
        type:Number,
        required:true
    },
    discountPrice:{
        type:Number,
        required:true
    },
    maxDiscount:{
        type:Number,
        required:true
    },
    minUser:{
        type:Number,
        required:true
    }
    

})
module.exports = mongoose.model('Coupon', couponSchema)