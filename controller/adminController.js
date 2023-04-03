const Admin = require('../model/adminModel');

const Users = require('../model/userModel');

const bcrypt = require("bcrypt");

const Category = require('../model/categoryModel')

const Product = require('../model/productModel');

const Order = require('../model/orderModel');

const Coupon = require('../model/couponModel');

const Banner = require('../model/bannerModel');

const pdf = require('html-pdf')

const fs = require('fs');

const path = require('path');

const ejs = require('ejs');

const moment = require("moment");


const loadAdminLogin = async (req, res) => {
    try {
        if (req.session.adminLogged == true) {
            res.redirect('/admin/home')
        } else {
            res.render('login')
        }

    } catch (error) {
        console.log(error.message);
    }
}

const verifyAdmin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password
        const adminEmail = await Admin.findOne({ email: email })

        if (adminEmail) {
            const passCheck = await bcrypt.compare(password, adminEmail.password)
            if (passCheck) {
                req.session.admin_id = adminEmail._id;
                req.session.adminLogged = true;
                res.redirect("/admin/home")
            } else {
                res.render('login', { message: "check Email or password " })
            }
        } else {
            res.render('login', { message: "check Email or password " })
        }

    } catch (error) {
        console.log(error.message);
    }

}

const adminDash = async (req, res) => {
    try {
        const categories = await Category.find({})
        const userData = await Users.find({ status: true })
        const user = userData.length
        const orderDelivered = await Order.find({ status: "Delivered" }).populate('productData.productId')
        const orderData = orderDelivered.length
        const peyment = orderDelivered.map((item) => item.dicountTotal).reduce((a, b) => a + b)
        const product = await Product.find({ is_active: true })
        const pro = product.length
        const orderDetails = await Order.find({})

        const categoryPush = []

        categories.forEach((category) => {
            const categoryCounts = orderDelivered.reduce((acc, order) => {
                const productDetails = order.productData;
                const categoryCount = productDetails.filter(details=> details.productId.category.toString() === category._id.toString()).length;
                return acc + categoryCount
                
            }, 0)
            categoryPush.push(categoryCounts)
           
        })
        
        const paymentRevenue = {
            CODRevenue: 0,
            onlineRevenue: 0,
            Refunded: 0,
        }

        orderDetails.forEach((order) => {

            if (order.peymentMethod == "UPI Payment " && order.status == "Delivered") {

                paymentRevenue.onlineRevenue += order.dicountTotal
            }
            if (order.status == "Returned" && order.paymentStatus == "Refunded") {

                paymentRevenue.Refunded += order.dicountTotal
            }
            if (order.peymentMethod == "Cash on Delivery" && order.status == "Delivered") {

                paymentRevenue.CODRevenue += order.dicountTotal
            }
        })
       

        res.render('home', { user, orderData, peyment, pro, paymentRevenue ,categories,categoryPush})
    } catch (error) {
        console.log(error.message);
    }
}

const loadUserdetails = async (req, res) => {
    try {
        const userData = await Users.find({})
        res.render('userDetails', { userData })
    } catch (error) {
        console.log(error.message);
    }
}

const adminLogout = async (req, res) => {
    try {
        req.session.admin_id = null;
        req.session.adminLogged = false;
        res.redirect('/admin/login')
    } catch (error) {
        console.log(error.message);
    }
}

const productViewAdmin = async (req, res) => {
    try {

        const productData = await Product.find({}).populate('category')
        res.render('productview', { productData })
    } catch (error) {
        console.log(error.message);
    }
}

const addProduct = async (req, res) => {
    try {
        const categoryName = await Category.find({})
        res.render('addProduct', { categoryName })
    } catch (error) {
        console.log(error.message);
    }
}

const uploadProduct = async (req, res) => {
    try {
        const categoryName = await Category.find({})
        const { productName, price, salePrice, quantity, category, description } = req.body;
        if (!productName.trim() || !price.trim() || !salePrice.trim() || !quantity.trim() || !description.trim() || !req.files || salePrice <= 0 || price <= 0 || quantity <= 0 || isNaN(salePrice)||isNaN(price)||isNaN(quantity)) {
            res.render('addProduct', { message: "Check all Fields Properly", categoryName })
        } else {

            const nameProduct = await Product.findOne({ productName: { $regex: '.*' + productName + '.*', $options: 'i' } })
            if (nameProduct) {
                res.render('addProduct', { message: "Product Name is Already Exists", categoryName })
            } else {


                const imageUpload = []
                for (let i = 0; i < req.files.length; i++) {
                    imageUpload[i] = req.files[i].filename
                }
                const products = new Product({
                    productName: req.body.productName,
                    price: req.body.price,
                    salePrice: req.body.salePrice,
                    quantity: req.body.quantity,
                    category: req.body.category,
                    description: req.body.description,
                    image: imageUpload,
                    is_active: true

                })
                const productData = await products.save()
                if (productData) {
                    res.redirect('/admin/productViewAdmin');
                } else {
                    res.render('addProduct', { errMessage: "Uploading failed" })
                }
            }
        }
    } catch (error) {
        console.log(error.message)
    }
}

const disableProduct = async (req, res) => {
    try {
        await Product.findByIdAndUpdate({ _id: req.query.id }, { $set: { is_active: false } })
        res.redirect('/admin/productViewAdmin')
    } catch (error) {
        console.log(error.message);
    }
}

const enableProduct = async (req, res) => {
    try {
        await Product.findByIdAndUpdate({ _id: req.query.id }, { $set: { is_active: true } })
        res.redirect('/admin/productViewAdmin')
    } catch (error) {
        console.log(error.message);
    }
}

const deleteUser = async (req, res) => {
    try {
        await Users.deleteOne({ _id: req.query.id })
        res.redirect('/admin/home')
    } catch (error) {
        console.log(error.message);
    }
}

const editProduct = async (req, res) => {
    try {
        req.session.query = req.query.id
        const categoryData = await Category.find({})
        const productData = await Product.findById({ _id: req.query.id }).populate('category')
        res.render('editProduct', { product: productData, categoryData })
    } catch (error) {
        console.log(error.message);
    }
}

const updateProduct = async (req, res) => {
    try {
        const categoryData = await Category.find({})
        const productData = await Product.findById({ _id: req.query.id }).populate('category')
        const { productName, price, salePrice, quantity, description } = req.body;
        if (!productName.trim() || !price.trim() || !salePrice.trim() || !quantity.trim() || !description.trim() || !req.files || salePrice <= 0 || price <= 0 || quantity <= 0) {
            res.render('editProduct', { message: "Check all Fields Properly", categoryData, product: productData })
        } else {
            const nameproduct = await Product.findOne({ productName: new RegExp(`^${productName}$`, 'i') })
            if (nameproduct) {


                res.render('editProduct', { product: productData, categoryData, message: "productName is Exists" })
            } else {
                for (let i = 0; i < req.files.length; i++) {
                    const imageUpload = req.files[i].filename
                    const productData = await Product.updateOne({ _id: req.body.id }, { $push: { image: imageUpload } })
                }
                const products = await Product.findByIdAndUpdate({ _id: req.body.id }, {
                    productName: req.body.productName,
                    price: req.body.price,
                    salePrice: req.body.salePrice,
                    quantity: req.body.quantity,
                    category: req.body.category,
                    description: req.body.description,
                })
                res.redirect("/admin/productViewAdmin")
            }

        }

    } catch (error) {
        console.log(error.message);
    }
}

const blockUser = async (req, res) => {
    try {
        const blockUser = await Users.findByIdAndUpdate({ _id: req.query.id }, { $set: { status: false } })

        res.redirect('/admin/userDetails')

    } catch (error) {
        console.log(error.message);
    }
}

const userUnBlock = async (req, res) => {
    try {
        const blockUser = await Users.findByIdAndUpdate({ _id: req.query.id }, { $set: { status: true } })

        res.redirect('/admin/userDetails')

    } catch (error) {
        console.log(error.message);
    }
}

const loadCategory = async (req, res) => {
    try {
        const categoryData = await Category.find({})
        res.render('category', { categoryData })

    } catch (error) {
        console.log(error.message);
    }
}

const addCategory = async (req, res) => {
    try {
        res.render('addCategory')
    } catch (error) {
        console.log(error.message);
    }
}

const insertCategory = async (req, res) => {
    try {
        if (req.body.categoryName.trim() === "") {
            res.render('addCategory', { message: "Feild is Empty" })
        } else {
            const categorys = new Category({
                categoryName: req.body.categoryName,
                is_active: true
            })
            const categoryName = await Category.findOne({ categoryName: new RegExp(`^${req.body.categoryName}$`, 'i') })
            if (categoryName) {
                res.render('addCategory', { message: "Name is Already Exists" })
            } else {
                const userData = await categorys.save();
                res.redirect('/admin/category')
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

const editCategoryLoad = async (req, res) => {
    try {
        const categoryData = await Category.findById({ _id: req.query.id })

        res.render('editCategory', { categoryData })
    } catch (error) {
        console.log(error.message);
    }
}

const editCategory = async (req, res) => {
    try {
        const categoryData = await Category.findById({ _id: req.query.id })
        if (req.body.categoryName.trim() === "") {
            res.render('editCategory', { message: "Feild is Empty", categoryData })
        } else {
            const categoryData = await Category.findOne({ categoryName: new RegExp(`^${req.body.categoryName}$`, 'i') })
            if (categoryData) {
                res.render('editCategory', { message: "Category name already Exists", categoryData })
            } else {
                const category = await Category.findByIdAndUpdate({ _id: req.query.id }, { $set: { categoryName: req.body.categoryName } })
                await Product.updateMany({ category: category._id }, { $set: { category: req.query.id } })

                res.redirect('/admin/category')
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}
const disableCategory = async (req, res) => {
    try {
        await Category.updateOne({ _id: req.query.id }, { $set: { is_active: false } })
        const category = await Category.findOne({ _id: req.query.id })
        const categoryId = category._id
        await Product.updateMany({ category: categoryId }, { $set: { is_active: false } })
        res.redirect('/admin/category')
    } catch (error) {
        console.log(error.message);
    }
}

const enableCategory = async (req, res) => {
    try {
        await Category.updateOne({ _id: req.query.id }, { $set: { is_active: true } })
        const category = await Category.findOne({ _id: req.query.id })
        const categoryId = category._id
        await Product.updateMany({ category: categoryId }, { $set: { is_active: true } })
        res.redirect('/admin/category')
    } catch (error) {
        console.log(error.message);
    }
}

const deleteImage = async (req, res) => {
    try {
        const id = req.query.id
        const imageUpdate = await Product.updateOne({ _id: req.session.query }, { $pull: { image: { $in: [id] } } })
        if (imageUpdate) {
            res.redirect('/admin/editProduct/?id=' + req.session.query);
        }
    } catch (error) {
        console.log(error.message);
    }
}

const userOrder = async (req, res) => {
    try {
        const orders = await Order.find().populate('userId').sort({ data: -1 })
        res.render('userOrder', { orders })
    } catch (error) {
        console.log(error.message);
    }
}

const orderView = async (req, res) => {
    try {
        const productDetails = await Order.findOne({ _id: req.query.id }).populate('productData.productId')
        const produts = productDetails.productData
        const address = productDetails.addressId
        const p = await Users.findOne({ _id: productDetails.userId, address: { $elemMatch: { _id: address } } }, { "address.$": 1, _id: 0 })
        const UserAddress = p.address

        res.render('userOrderView', { produts, productDetails, UserAddress })
    } catch (error) {
        console.log(error.message);
    }
}

const changeStatus = async (req, res) => {
    try {

        await Order.findByIdAndUpdate({ _id: req.body.orderId }, { $set: { status: req.body.status } })
        if (req.body.status === "Delivered") {
            await Order.findByIdAndUpdate({ _id: req.body.orderId }, { $set: { paymentStatus: "Payment completed" } })
            res.redirect('/admin/orderView?id=' + req.body.orderId)
        } else {
            res.redirect('/admin/orderView?id=' + req.body.orderId)
        }


    } catch (error) {
        console.log(error.message);
    }
}

const loadCoupon = async (req, res) => {
    try {
        const couponData = await Coupon.find({})
        res.render('couponList', { couponData })
    } catch (error) {
        console.log(error.message);
    }
}

const addCoupon = async (req, res) => {
    try {
        res.render('addCoupon')
    } catch (error) {
        console.log(error.message);
    }
}

const insertCoupon = async (req, res) => {
    try {

        const couponData = new Coupon({
            coupon: req.body.categoryName,
            couponType: req.body.inlineRadioOptions,
            ExpiryDate: req.body.expiryDate,
            minPrice: req.body.minOrder,
            discountPrice: req.body.discountPrice,
            maxDiscount: req.body.maxDiscount,
            minUser: req.body.totalUser,
            status: "Active",

        })
        const date = new Date()
        const expiryDate = new Date(req.body.expiryDate)

        const couponCode = await Coupon.findOne({ coupon: new RegExp(`^${req.body.categoryName}$`, 'i') })
        if (couponCode) {
            res.render('addCoupon', { message: "Code is Already Exists" })
        } else if (!req.body.categoryName.trim()) {
            res.render('addCoupon', { message: " Field is Empty Enter a Valid Code " })
        } else if (req.body.minOrder <= 0 || isNaN(req.body.minOrder) || !req.body.minOrder.trim()) {
            res.render('addCoupon', { message: " Enter Valid Positive Number " })
        } else if (req.body.discountPrice <= 0 || isNaN(req.body.discountPrice || !req.body.minOrder.trim())) {
            res.render('addCoupon', { message: "Enter Valid Positive Number " })
        } else if (req.body.maxDiscount <= 0 || isNaN(req.body.maxDiscount || !req.body.minOrder.trim())) {
            res.render('addCoupon', { message: "Enter Valid Positive Number" })
        } else if (req.body.totalUser <= 0 || isNaN(req.body.totalUser || !req.body.minOrder.trim())) {
            res.render('addCoupon', { message: "Enter Valid Positive Number " })
        } else if (expiryDate < date) {
            res.render('addCoupon', { message: "Expiry date must be greater than the current date. " })
        } else if (!req.body.inlineRadioOptions) {
            res.render('addCoupon', { message: "Select any coupon type" })
        } else {
            await couponData.save()
            res.redirect('/admin/couponList')
        }

    } catch (error) {
        console.log(error.message);
    }
}

const loadBanner = async (req, res) => {
    try {
        const bannerData = await Banner.find({})
        res.render('bannerList', { bannerData })
    } catch (error) {
        console.log(error.message);
    }
}

const addBanner = async (req, res) => {
    try {
        res.render('addBanner')
    } catch (error) {
        console.log(error.message)
    }
}

const insertBanner = async (req, res) => {
    try {

        if (!req.body.title.trim() || !req.body.Description.trim() || !req.body.subHead.trim() || !req.body.Percentage.trim()) {
            res.render('addBanner', { message: "Fields Contain empty or White space" })
        } else {
            const image = req.files[0].filename
            const data = new Banner({
                image: image,
                title: req.body.title,
                description: req.body.Description,
                subHead: req.body.subHead,
                Percentage: req.body.Percentage,
            })

            await data.save()
        }


        res.redirect('/admin/bannerList')
    } catch (error) {
        console.log(error.message);
    }
}

const deleteBanner = async (req, res) => {
    try {
        await Banner.deleteOne({ _id: req.query.id })
        res.redirect('/admin/bannerList')
    } catch (error) {
        console.log(error.message);
    }
}

const salesReport = async (req, res) => {
    try {
        const orderData = await Order.find({ status: "Delivered" }).populate('productData.productId')
        res.render('saleReport', { orderData })
    } catch (error) {
        console.log(error.message);
    }
}

const dateFilter = async (req, res) => {
    try {

        if (req.body) {
            const orderData = await Order.find({ status: "Delivered", date: { $gte: new Date(req.body.date1), $lte: new Date(req.body.date2) } }).populate('productData.productId')

            res.json({ orderData })
        } else {
            const orderData = await Order.find({ status: "Delivered" }).populate('productData.productId')
            res.json({ orderData })
        }
    } catch (error) {
        console.log(error.message);
    }
}

const SalesPdf = async (req, res) => {
    try {
        let data;
        if (req.body.formDate === '' || req.body.toDate === '') {
            const orderSuccess = await Order.find({ status: "Delivered" }).populate('productData.productId')

            data = {
                orderSuccess: orderSuccess
            }
            console.log(data);
        } else {

            const start = req.body.fromDate
            const end = req.body.toDate
            console.log(new Date(start));
            console.log(new Date(end));
            const orderSuccess = await Order.find({ status: "Delivered", date: { $gte: new Date(start), $lte: new Date(end) } }).populate('productData.productId')
            data = {
                orderSuccess: orderSuccess
            }
        }
        const filePath = path.resolve(__dirname, '../view/admin/salesPdf.ejs')
        const htmlString = fs.readFileSync(filePath).toString()
        const ejsData = ejs.render(htmlString, data)
        let options = {
            format: 'A4',
            orientation: "portrait",
            border: "10mm"

        }
        pdf.create(ejsData, options).toStream((err, stream) => {
            if (err) {
                console.log(err);
            }
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="sales-report.pdf"'
            });

            stream.pipe(res);
        });

        console.log('pdf generated')
    } catch (error) {
        console.log(error.message);
    }
}

const deleteCoupon = async (req, res) => {
    try {

        await Coupon.deleteOne({ _id: req.query.id })
        res.redirect('/admin/couponList')
    } catch (error) {
        console.log(error.message)
    }
}

// for graphDetails
const graphDetails = async (req, res, next) => {
    try {
        const currentDate = moment();
        const sixMonthsAgo = moment().subtract(6, 'months');
        const lastSixMonths = [];

        for (let date = moment(sixMonthsAgo); date.isSameOrBefore(currentDate); date.add(1, 'month')) {
            lastSixMonths.push(date.format('MMM'));
        }
        const orders = await Order.find({ date: { $gte: sixMonthsAgo } })
            .populate('productData.productId')
            .exec();
        const incomeData = []
        let orderData = [];
        let users = [];

        const userData = await Users.find({ createdAt: { $gte: sixMonthsAgo } })
        for (let i = 6; i >= 0; i--) {
            const sixMonthsAgo = moment().subtract(i, 'months');
            const startDate = moment(sixMonthsAgo).startOf('month');
            const endDate = moment(sixMonthsAgo).endOf('month');
            const orderDataCount = orders.filter((order) =>
                order.status == "Delivered" &&
                moment(order.date) >= startDate && moment(order.date) <= endDate
            ).length;
            const userCount = userData.filter((user) =>
                moment(user.createdAt) >= startDate && moment(user.createdAt) <= endDate
            ).length;
            const incomeCount = orders.filter((order) =>
                order.status == "Delivered" &&
                moment(order.date) >= startDate && moment(order.date) <= endDate
            ).map((order) => order.dicountTotal)
            incomeData.push(incomeCount)
            users.push(userCount);
            orderData.push(orderDataCount);
        }
        const incomePerMonth = incomeData.reduce((acc, cur) => {
            const sum = cur.reduce((a, b) => a + b, 0);
            acc.push(sum);
            return acc;
        }, []);
        const orderDetails = await Order.find({ status: "Delivered" }).populate('productData.productId')

        const orderCount = orderDetails.length;

        const totalProducts = orderDetails.reduce((acc, order) => {
            const productDetails = order.productData.length
            return acc + productDetails;
        }, 0)

        
        const categories = await Category.find({})
        const categoryNames = [];
        const categoryPerc = [];
        categories.forEach((category) => {
            const categoryCount = orderDetails.reduce((acc, order) => {
                const productDetails = order.productData;
                const categoryCount = productDetails.filter(details=> details.productId.category.toString() == category._id.toString()).length;
                return acc + categoryCount;
            }, 0)

            const categoryPercentage = (categoryCount / totalProducts) * 100;
            categoryNames.push(category.categoryName)
            categoryPerc.push(categoryPercentage)
            
        })
        res.json({ lastSixMonths, orderData, users, incomePerMonth,categoryNames,categoryPerc})
    } catch (error) {
        console.log(error.message)
    }
}




module.exports = {
    loadAdminLogin,
    verifyAdmin,
    adminDash,
    loadUserdetails,
    productViewAdmin,
    addProduct,
    uploadProduct,
    disableProduct,
    deleteUser,
    editProduct,
    updateProduct,
    adminLogout,
    blockUser,
    userUnBlock,
    loadCategory,
    addCategory,
    insertCategory,
    editCategory,
    editCategoryLoad,
    disableCategory,
    deleteImage,
    userOrder,
    orderView,
    changeStatus,
    loadCoupon,
    addCoupon,
    insertCoupon,
    enableProduct,
    loadBanner,
    addBanner,
    insertBanner,
    enableCategory,
    deleteBanner,
    salesReport,
    dateFilter,
    SalesPdf,
    deleteCoupon,
    graphDetails
}