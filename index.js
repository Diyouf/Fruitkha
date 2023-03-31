require('dotenv').config()
const mongoose = require("mongoose");
mongoose.set("strictQuery",false);
mongoose.connect(process.env.MONGODB_CONNECTION)

const express = require("express");
const app = express();

app.use((req,res,next)=>{
    res.set('cache-control','no-store');
    next();
})

//for user Routes
const userRouter = require('./router/userRoute');
app.use('/',userRouter);

//for admin Routes
const adminRouter = require('./router/adminRoute');
app.use('/admin',adminRouter);



const path = require('path');
app.use(express.static(path.join(__dirname,'/public')))

app.listen(3001,()=>{
    console.log("Server Running....")
})
