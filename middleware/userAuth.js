const User = require("../model/userModel")

const isLogin = async(req,res,next)=>{
    try {
        if (req.session.user_id){

        }else{
            res.redirect('/');
        }
        next(); 
        
    } catch (error) {
        console.log(error.message)
    }
}

const isLogout = async(req,res,next)=>{
    try {
        if (req.session.user_id){
            res.redirect('/')
        }
        else{
            next(); 
        }
       
    } catch (error) {
        console.log(error.message)
    }
}



const isBlocked = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            const userData = await User.findById({ _id: req.session.user_id })
            if (userData.status == false) {
                req.session.user_id = null
                req.session.userLogged = false;
                console.log("Blocked");
                res.render('adminBlocked')
            } else {
                next()
            }
        } else {
            next()
        }
    }
    catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    isLogin,
    isLogout,
    isBlocked
}