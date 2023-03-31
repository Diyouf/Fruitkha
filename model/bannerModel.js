const mongoose = require("mongoose")

const detailstSchema = mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    Persentage:{
        type:Number,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    subHead:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    }

   
})
module.exports = mongoose.model('Banner',detailstSchema)