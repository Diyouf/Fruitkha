const mongoose = require("mongoose")

const categorySchema = mongoose.Schema({
    categoryName:{
        type:String,
        required:true
    },
    is_active:{
        type:Boolean,
        required:true
    }
})
module.exports = mongoose.model('category',categorySchema)