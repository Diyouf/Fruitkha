const express = require("express")

const user_route = express();

user_route.use(express.json())
user_route.use(express.urlencoded({extended:false}))

const userAuth = require("../middleware/userAuth")

const config = require("../config/userConfig")

const session = require("express-session")

user_route.use(session({
    name:"userSession",
    secret:config.sessionSecret,
}))

user_route.use((req,res,next)=>{
    res.set('cache-control','no-store');
    next();
})


user_route.set('view engine','ejs');
user_route.set('views','./view/user')

const userController = require("../controller/userController");

user_route.get('/register',userAuth.isLogout,userController.loadRegister);

user_route.post('/register',userAuth.isLogout,userController.insertUser)

user_route.get('/login',userController.loadLogin)

user_route.get('/',userAuth.isBlocked,userController.loadHome)

user_route.get('/logout',userAuth.isLogin,userController.userLogout)

user_route.post('/login',userAuth.isLogout,userController.verifyLogin)

user_route.get('/otpNo.',userAuth.isLogout,userController.loadOtpPage)

user_route.get('/about',userAuth.isBlocked,userController.loadAbout)

user_route.get('/addCart',userAuth.isBlocked,userAuth.isLogin,userController.insertCart)

user_route.get('/cart',userAuth.isBlocked,userController.loadCart)

user_route.get('/contact',userAuth.isBlocked,userController.loadContact)

user_route.get('/shop',userAuth.isBlocked,userController.loadShop)

user_route.get('/productView',userAuth.isBlocked,userController.productView)

user_route.post('/otpNo.',userAuth.isLogout,userController.getOtp)

user_route.get('/otpPage',userAuth.isLogout,userController.loadOtpPgae)

user_route.post('/otpPage',userAuth.isLogout,userController.verifyOtp)

user_route.get('/resend',userAuth.isLogout,userController.resendOtp)

user_route.get('/signUpOtp',userAuth.isLogout,userController.otppageLoad)

user_route.post('/signUpOtp',userAuth.isLogout,userController.verifySignUp)

user_route.get('/checkOut',userAuth.isLogin,userAuth.isBlocked,userController.loadCheckout)

user_route.get('/userProfile',userAuth.isLogin,userAuth.isBlocked,userController.loadUserProfile)

user_route.get('/userAddress',userAuth.isLogin,userAuth.isBlocked,userController.loadUserAddress)

user_route.post('/userAddress',userAuth.isLogin,userAuth.isBlocked,userController.addAddress)

user_route.get('/userEdit',userAuth.isLogin,userAuth.isBlocked,userController.userEdit)

user_route.post('/userEdit',userAuth.isLogin,userAuth.isBlocked,userController.updateUser)

user_route.get('/addressDelete',userAuth.isLogin,userAuth.isBlocked,userController.deleteAddress)

user_route.get('/deleteProductCart',userAuth.isBlocked,userAuth.isLogin,userController.deleteProductCart)

user_route.get('/addressEdit',userAuth.isLogin,userAuth.isBlocked,userController.addressEdit)

user_route.post('/addressEdit',userAuth.isBlocked,userAuth.isLogin,userController.uploadEdit)

user_route.post('/change-product-quantity',userAuth.isBlocked,userAuth.isLogin,userController.changeQuantity)

user_route.post('/checkOut',userAuth.isLogin,userAuth.isBlocked,userController.placeOder)

user_route.get('/OrderList',userAuth.isLogin,userAuth.isBlocked,userController.orderList)

user_route.get('/orderView',userAuth.isLogin,userAuth.isBlocked,userController.orderView)

user_route.get('/wishList',userAuth.isLogin,userAuth.isBlocked,userController.loadWishlist)

user_route.get('/addWishList',userAuth.isLogin,userAuth.isBlocked,userController.insertWishList)

user_route.get('/removeWishpro',userAuth.isLogin,userAuth.isBlocked,userController.removePro)

user_route.get('/moveToCart',userAuth.isLogin,userAuth.isBlocked,userController.moveToCart)

user_route.get('/orderCancel',userAuth.isLogin,userAuth.isBlocked,userController.cancelOrder)

user_route.get('/orderReturn',userAuth.isLogin,userAuth.isBlocked,userController.returnOrder)

user_route.get('/orderConfirmation',userAuth.isLogin,userAuth.isBlocked,userController.orderConfirmation)

user_route.post('/verifyPayment',userAuth.isBlocked,userAuth.isLogin,userController.verifyPayment)

user_route.post('/applyCoupon',userAuth.isBlocked,userAuth.isLogin,userController.applyCoupon)

user_route.post('/userProfile',userAuth.isBlocked,userAuth.isLogin,userController.changePass)

user_route.post('/categoryFilter',userAuth.isBlocked,userController.categoryFilter)

user_route.get('/resendSignUp',userController.resendOtpSignup)



const errorHandler = require('../middleware/errorHandling');
user_route.use(errorHandler.errorHandler)




module.exports = user_route;



