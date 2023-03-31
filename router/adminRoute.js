const express = require("express")

const admin_route = express();

const session = require("express-session")

const path = require("path")

const multer = require('multer')

const config = require('../config/adminConfig');

admin_route.use((req,res,next)=>{
  res.set('cache-control','no-store');
  next();
})

var storage = multer.diskStorage({

    destination: function (req, file, cb) {
      cb(null,path.join(__dirname,'../public/productImage'))
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname 
      cb(null, name)
    }
  })
  var upload = multer({ storage: storage })  

const adminController = require("../controller/adminController")

const auth = require("../middleware/adminAuth")

admin_route.use(session({
  name:"adminSession",
  secret:config.adminsessionSecret,
}))


admin_route.set('view engine','ejs'); 
admin_route.set('views','./view/admin');


admin_route.get('/login',auth.isLogout,adminController.loadAdminLogin)

admin_route.post('/login',adminController.verifyAdmin)

admin_route.get('/home',auth.isLogin,adminController.adminDash)

admin_route.get('/adminLogout',auth.isLogin,adminController.adminLogout)

admin_route.get('/userDetails',auth.isLogin,adminController.loadUserdetails)

admin_route.get('/productViewAdmin',auth.isLogin,adminController.productViewAdmin)

admin_route.get('/addProduct',auth.isLogin,adminController.addProduct)

admin_route.post('/addProduct',upload.array('image',3),adminController.uploadProduct)

admin_route.get('/deleteProduct',auth.isLogin,adminController.disableProduct)

admin_route.get('/enableProduct',auth.isLogin,adminController.enableProduct)

admin_route.get('/deleteUser',auth.isLogin,adminController.deleteUser)

admin_route.get('/editProduct',auth.isLogin,adminController.editProduct)

admin_route.post('/editProduct',upload.array('image',3),adminController.updateProduct)

admin_route.get('/userBlock',auth.isLogin,adminController.blockUser)

admin_route.get('/userUnblock',auth.isLogin,adminController.userUnBlock)

admin_route.get('/category',auth.isLogin,adminController.loadCategory)

admin_route.get('/addCategory',auth.isLogin,adminController.addCategory)

admin_route.post('/addCategory',adminController.insertCategory)

admin_route.get('/editCategory',auth.isLogin,adminController.editCategoryLoad)

admin_route.post('/editCategory',adminController.editCategory)

admin_route.get('/deleteCategory',auth.isLogin,adminController.disableCategory)

admin_route.get('/enableCategory',auth.isLogin,adminController.enableCategory)

admin_route.get('/deleteImage',adminController.deleteImage);

admin_route.get('/userOrder',adminController.userOrder)

admin_route.get('/orderView',adminController.orderView)

admin_route.post('/orderView',adminController.changeStatus)

admin_route.get('/couponList',adminController.loadCoupon)

admin_route.get('/addCoupon',adminController.addCoupon)

admin_route.post('/addCoupon',adminController.insertCoupon)

admin_route.get('/bannerList',adminController.loadBanner)

admin_route.get('/addBanner',adminController.addBanner)

admin_route.post('/addBanner',upload.array('image',1),adminController.insertBanner)

admin_route.get('/deleteBanner',adminController.deleteBanner)

admin_route.get('/salesReport',adminController.salesReport)

admin_route.post('/dateFilter',adminController.dateFilter)

admin_route.post('/salesPdf',adminController.SalesPdf)

admin_route.get('/deleteCoupon',adminController.deleteCoupon)

admin_route.get('/graphDetails',adminController.graphDetails)

module.exports = admin_route;