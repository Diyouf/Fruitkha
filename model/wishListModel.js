const { ObjectId } = require("mongodb")
const mongoose = require("mongoose")

const productSchema = mongoose.Schema({
    productId:{
        type:ObjectId,
        ref:'Product'       
    },
  
})
const wishListScheama = mongoose.Schema({
    userData:{
        type:ObjectId,
        require:true
    },
    
    products:[productSchema],
    
})
module.exports = mongoose.model('wishList',wishListScheama)