const User = require('../model/userModel');
const Product = require('../model/productModel');
const Cart = require('../model/cartModel');
const bcrypt = require("bcrypt");
const Order = require('../model/orderModel');
const wishList = require('../model/wishListModel');
const Coupon = require('../model/couponModel');
const Category = require('../model/categoryModel');
const Banner = require('../model/bannerModel');
const crypto = require("crypto")
require('dotenv').config()

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const verifySid = process.env.VERIFY_SID;
const client = require("twilio")(accountSid, authToken);

const Razorpay = require('razorpay');
const instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
});

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;

    } catch (error) {
        next(error)
    }
}

const loadRegister = async (req, res, next) => {
    try {
        res.render('register')
    } catch (error) {
        next(error)
    }
}

const insertUser = async (req, res, next) => {
    try {
        const regex = /^(?=.*[@$!%*?&#+-])[@$!%*?&#+-\w]*$/;
        if (req.body.password.match(regex)) {
            if (req.body.name.trim() === "" || req.body.name.match(regex)) {
                res.render('register', { errMassege: "Enter a valid name" });
            } else if (req.body.mobile.trim() === "" || isNaN(req.body.mobile)) {
                res.render('register', { mobMassege: "Enter a valid mobile" })
            } else if (req.body.email.trim() === "") {
                res.render('register', { EmMassege: "Enter email" })
            } else if (req.body.password.length <= 8) {
                res.render('register', { passError: "Minimum 8 Character" })
            } else if (req.body.password != req.body.repassword) {
                res.render('register', { passMessage: "password is not same" })
            } else if (isNaN(req.body.mobile) || req.body.mobile.length != 10) {
                res.render('register', { mobileMassege: "Enter 10 Number" })
            } else {
                req.session.userData = req.body
                const userMobile = await User.findOne({ mobile: req.session.userData.mobile })
                if (userMobile) {
                    res.render('register', { mobileMassege: "mobile is Already Exit" })
                } else {
                    const userEmail = await User.findOne({ email: req.session.userData.email })

                    if (userEmail) {
                        res.render('register', { emailMassege: "Email is Already Exit" })
                    } else {

                        client.verify.v2
                            .services(verifySid)
                            .verifications.create({ to: "+91" + req.session.userData.mobile, channel: "sms" })
                            .then((verification) => {
                                console.log(verification.status)
                                res.redirect('/signUpOtp')
                            })
                    }
                }
            }
        } else {
            res.render('register', { passError: "Use any special Charactor like:@,$,!...." })
        }
    } catch (error) {
        next(error)
    }
}

const otppageLoad = async (req, res, next) => {
    try {
        res.render('signUpOtp', { number: req.session.userData.mobile })
    } catch (error) {
        next(error)
    }
}

const verifySignUp = async (req, res, next) => {
    try {
        const otp = req.body.otp;
        const spassword = await securePassword(req.session.userData.password)
        client.verify.v2
            .services("VA7af70251e13b3308736a34f237702b4a")
            .verificationChecks.create({ to: "+91" + req.session.userData.mobile, code: otp })
            .then((verification_check) => {
                if (verification_check.status === 'approved') {
                    (async () => {
                        const user = new User({
                            name: req.session.userData.name,
                            email: req.session.userData.email,
                            mobile: req.session.userData.mobile,
                            password: spassword,
                            is_admin: 0,
                            status: true

                        })
                        const userData = await user.save();
                        if (userData) {
                            res.render('signUpOtp', { successMessage: "your Registration has been successfull" })
                        } else {
                            res.render('signUpOtp', { message: "your registration has been failed " })
                        }
                    })()
                } else {
                    res.render('signUpOtp', { message: "Invalid Otp" })
                }
            })
    }
    catch (error) {
        next(error)
    }
}

const resendOtpSignup = async (req, res, next) => {
    try {
        client.verify.v2
            .services(verifySid)
            .verifications.create({ to: "+91" + req.session.userData.mobile, channel: "sms" })
            .then((verification) => {
                console.log(verification.status)
                res.redirect('/signUpOtp')
            })
    }
    catch (error) {
        next(error)
    }

}

const loadLogin = async (req, res, next) => {
    try {
        res.render('login')

    } catch (error) {
        next(error)
    }
}

const loadland = async (req, res, next) => {
    try {
        res.render('landingPage')
    } catch (error) {
        next(error)
    }
}

const cartLand = async (req, res, next) => {
    try {
        res.render('cartLand')
    } catch (error) {
        next(error)
    }
}

const verifyLogin = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email })
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password)
            if (passwordMatch) {
                if (userData.status == false) {
                    res.render('login', { Vmessage: "You are Blocked by Admin" })
                } else {
                    req.session.userLogged = true;
                    req.session.user_id = userData._id;
                    res.redirect('/');
                }
            } else {
                res.render('login', { Vmessage: "Password is Incorrect!" })
            }
        } else {
            res.render('login', { Vmessage: "Email is not is valid!" })
        }

    } catch (error) {
        next(error)
    }
}

const loadHome = async (req, res, next) => {
    try {
        const productData = await Product.find({is_active:true})
        const bannerData = await Banner.find({})
        if (req.session.userLogged) {
            const userData = await User.findOne({ _id: req.session.user_id })
            res.render('home', { userData, productData, bannerData })
        } else {

            res.render('home', { productData, bannerData })
        }
    } catch (error) {
        next(error)
    }
}

const userLogout = async (req, res, next) => {
    try {
        req.session.user_id = null;
        req.session.userLogged = false;
        res.redirect('/');

    } catch (error) {
        next(error)
    }
}

const loadOtpPage = async (req, res, next) => {
    try {
        res.render('numberInsert')
    } catch (error) {
        next(error)
    }
}

const loadAbout = async (req, res, next) => {
    try {
        if (req.session.userLogged) {
            const userData = await User.findOne({ _id: req.session.user_id })
            res.render('about', { userData })
        } else {
            res.render('about')
        }

    } catch (error) {
        next(error)
    }
}

const loadCart = async (req, res, next) => {
    try {
        if (req.session.userLogged) {
            const userData = await User.findOne({ _id: req.session.user_id })
            const userCart = await Cart.findOne({ userData: userData._id }).populate('products.productId')

            if (userCart) {
                const cartProducts = userCart.products
                const { totalSalePrice } = cartProducts.reduce((acc, cur) => {
                    acc.totalSalePrice += cur.total;
                    return acc;
                }, { totalSalePrice: 0 });

                res.render('cart', { cartProducts, userCart, totalSalePrice, userData })

            } else {
                res.render('cart',{userData})
            }
        } else {
            res.render('cart')
        }

    } catch (error) {

        next(error)
    }
}

const insertCart = async (req, res, next) => {
    try {
        const productData = await Product.findById({ _id: req.query.id })
        const UserId = await Cart.findOne({ userData: req.session.user_id })

        const product = {
            productId: productData._id,
            quantity: 1,
            total: productData.salePrice
        }

        if (UserId) {
            let proExit = UserId.products.findIndex(product => product.productId == req.query.id)

            if (proExit != -1) {

                await Cart.updateOne({ userData: req.session.user_id, 'products.productId': req.query.id },
                    {
                        $inc: { 'products.$.quantity': 1, 'products.$.total': productData.salePrice, total: productData.salePrice }
                    })

                res.redirect('/cart')
            } else {
                await Cart.findByIdAndUpdate({ _id: UserId._id }, { $push: { products: product } })
                res.redirect('/cart')
            }
        } else {
            const cart = new Cart({
                products: product,
                userData: req.session.user_id,
                total: productData.salePrice
            })

            await cart.save();

            res.redirect('/cart')
        }
    } catch (error) {
        next(error)
    }
}

const loadContact = async (req, res, next) => {
    try {
        if (req.session.userLogged) {
            const userData = await User.findOne({ _id: req.session.user_id })
            res.render('contact', { userData })
        } else {
            res.render('contact')
        }
    } catch (error) {
        next(error)
    }
}

const loadShop = async (req, res, next) => {
    try {
        const category = await Category.find({})
        const productData = await Product.find({ is_active: true })
        if (req.session.userLogged) {
            const userData = await User.findOne({ _id: req.session.user_id })
            res.render('shop', { productData, userData, category })
        } else {
            res.render('shop', { productData, category })

        }
    } catch (error) {
        next(error)
    }
}

const productView = async (req, res, next) => {
    try {
        const productData = await Product.findById({ _id: req.query.id }).populate('category')
        if (req.session.userLogged) {
            const userData = await User.findOne({ _id: req.session.user_id })
            res.render('singleProductView', { product: productData, userData })
        } else {
            res.render('singleProductView', { product: productData })

        }

    } catch (error) {
        next(error)
    }
}

const getOtp = async (req, res, next) => {
    try {
        if (req.body.number.length == 10 || isNaN(req.body.number)) {

            const mobileData = await User.findOne({ mobile: req.body.number })
            if (!mobileData) {
                res.render('numberInsert', { numErr: "Number  is not registered" })

            }
            else if (mobileData.status == false) {
                res.render('numberInsert', { numErr: "You are Blocked by Admin" })
            } else {

                req.session.number = req.body.number

                client.verify.v2
                    .services(verifySid)
                    .verifications.create({ to: "+91" + req.session.number, channel: "sms" })
                    .then((verification) => {
                        console.log(verification.status)
                        res.redirect('/otpPage')
                    })
            }
        } else {
            res.render('numberInsert', { numErr: "Enter valid 10 Digits" })
        }
    }
    catch (error) {
        next(error)
    }
}

const resendOtp = async (req, res, next) => {
    try {
        client.verify.v2
            .services(verifySid)
            .verifications.create({ to: "+91" + req.session.number, channel: "sms" })
            .then((verification) => {
                console.log(verification.status)
                res.redirect('/otpPage')
            })
    }
    catch (error) {
        next(error)
    }

}

const loadOtpPgae = async (req, res, next) => {

    try {
        res.render('otpPage', { number: req.session.number })

    } catch (error) {
        next(error)
    }
}

const verifyOtp = async (req, res, next) => {
    try {
        const otp = req.body.otp
        const number = req.session.number
        client.verify.v2
            .services("VA7af70251e13b3308736a34f237702b4a")
            .verificationChecks.create({ to: "+91" + number, code: otp })
            .then(async (verification_check) => {
                if (verification_check.status === 'approved') {
                    const UserId = await User.findOne({ mobile: req.session.number })
                    req.session.user_id = UserId._id;
                    console.log(UserId._id);
                    req.session.userLogged = true
                    res.redirect('/')
                } else {
                    res.render('otpPage', { message: "Invalid Otp" })
                }

            })
    } catch (error) {
        next(error)
    }
}

const loadCheckout = async (req, res, next) => {
    try {
        const userData = await User.findOne({ _id: req.session.user_id })
        const addressData = userData.address
        const userCart = await Cart.findOne({ userData: req.session.user_id })
        const cartProducts = userCart.products
        const { totalSalePrice } = cartProducts.reduce((acc, cur) => {
            acc.totalSalePrice += cur.total;
            return acc;
        }, { totalSalePrice: 0 });
        res.render('checkOut', { totalSalePrice, addressData, userData })
    } catch (error) {
        next(error)
    }
}

const loadUserProfile = async (req, res, next) => {
    try {
        const userData = await User.findOne({ _id: req.session.user_id })
        res.render('userProfile', { userData })
    } catch (error) {
        next(error)
    }
}

const loadUserAddress = async (req, res, next) => {
    try {
        const userData = await User.findOne({ _id: req.session.user_id, });
        const addressData = userData.address.filter(address => address.status === true);
        res.render('userAddress', { userData, addressData })
    } catch (error) {
        next(error)
    }
}



const addAddress = async (req, res, next) => {
    try {
        const { firstName, secondName, mobile, pincode, address, landMark } = req.body
        if (!secondName.trim() || !mobile.trim() || !pincode.trim() || !firstName.trim() || !address.trim() || !landMark.trim()) {
            const userData = await User.findOne({ _id: req.session.user_id })
            const addressData = userData.address
            res.render('userAddress', { addressData, userData, errMsg: "Input is empty or contains only white space" })
        } else {
            const userAddress = {
                fullName: req.body.firstName + req.body.secondName,
                mobile: req.body.mobile,
                pincode: req.body.pincode,
                state: req.body.state,
                city: req.body.city,
                address: req.body.address,
                landMark: req.body.landMark,
                status: true
            }
            await User.findByIdAndUpdate({ _id: req.session.user_id }, { $push: { address: userAddress } })

            const addresses = await new User({
                address: [userAddress]
            })
            if (req.session.checkout) {
                res.redirect('/checkOut')
            } else {
                res.redirect('/userAddress')
            }
        }
    } catch (error) {
        next(error)
    }
}

const userEdit = async (req, res, next) => {
    try {
        const userData = await User.findOne({ _id: req.session.user_id })

        res.render('editUser', { userData })
    } catch (error) {
        next(error)
    }
}

const deleteAddress = async (req, res, next) => {
    try {
        await User.updateOne({ _id: req.session.user_id, "address._id": req.query.id }, { $set: { "address.$.status": false } })
        if (req.session.checkout) {
            res.redirect('/checkOut')
        } else {
            res.redirect('/userAddress')
        }


    } catch (error) {
        next(error)
    }
}
const updateUser = async (req, res, next) => {
    try {
        const userData = await User.findOne({ _id: req.session.user_id })
        const checkName = await User.findOne({ name: req.body.name })
        const checkEmail = await User.findOne({ email: req.body.email })
        if (req.body.name.trim() === "") {
            res.render('editUser', { message: "Field is Empty", userData })
        } else if (checkName) {
            res.render('editUser', { message: "Name Already Exists", userData })
        } else if (checkEmail) {
            res.render('editUser', { message: "Email Already Exists", userData })

        } else {
            await User.updateOne({ _id: req.query.id }, { $set: { name: req.body.name, email: req.body.email, } })
            res.redirect('/userProfile')
        }

    } catch (error) {
        next(error)
    }
}

const deleteProductCart = async (req, res, next) => {
    try {
        await Cart.updateOne({ userData: req.session.user_id, "products.productId": req.query.id }, { $pull: { products: { productId: req.query.id } } })

        res.redirect('/cart')
    } catch (error) {
        next(error)
    }
}

const addressEdit = async (req, res, next) => {
    try {
        const addressData = await User.findOne({ "address._id": req.query.id }, { "address.$": 1 })
        req.session.checkout = req.query.checkout
        const userData = await User.findOne({ _id: req.session.user_id })
        const address = addressData.address
        res.render('editAddress', { userData, address })
    } catch (error) {
        next(error)
    }
}

const uploadEdit = async (req, res, next) => {
    try {
        const { fullName, mobile, city, state, address, landMark, pincode, addressId } = req.body
        if (!fullName.trim() || !mobile.trim() || isNaN(mobile) ||
            !city.trim() || !state.trim() || !address.trim() || !landMark.trim() || !pincode.trim() || isNaN(pincode)) {
            const addressData = await User.findOne({ "address._id": addressId }, { "address.$": 1 });
            res.render('edit-address', { error: "Some error, try again", addressData: addressData.address })
        } else {


            const updatedAddress = await User.updateOne({ "address._id": addressId }, {
                $set: {
                    "address.$": {
                        fullName: fullName,
                        mobile: mobile,
                        city: city,
                        state: state,
                        address: address,
                        landMark: landMark,
                        pincode: pincode
                    }
                }
            });
            if (req.session.checkout) {
                res.redirect('/checkOut')
                delete req.session.checkout;
            } else {
                res.redirect('/userAddress')
            }
        }
    } catch (error) {
        next(error)
    }
}

const changeQuantity = async (req, res, next) => {
    try {
        const productPrice = await Product.findOne({ _id: req.body.productId })
        
        const userData = req.body.userData
        const productId = req.body.productId
        const quantity = req.body.quantity


        const cartData = await Cart.findOneAndUpdate({ _id: userData, 'products.productId': productId }, {})
        const dd = cartData.products.find(item => item.productId == req.body.productId)
        const totalQuantity = dd.quantity + Number(quantity)
        if (totalQuantity > 0) {
            await Cart.findOneAndUpdate({ _id: userData, 'products.productId': productId }, { $inc: { 'products.$.quantity': quantity } })
            if (quantity == 1) {
                const subTotal = dd.total + productPrice.salePrice
                const stock = productPrice.quantity
                await Cart.findOneAndUpdate({ _id: req.body.userData, 'products.productId': productId }, { $set: { "products.$.total": Number(subTotal) } })
                res.json({ success: true, total: dd.total,stock })
            } else {
                const subTotal = dd.total - productPrice.salePrice
                await Cart.findOneAndUpdate({ _id: req.body.userData, 'products.productId': productId }, { $set: { "products.$.total": Number(subTotal) } })
                res.json({ success: false, total: dd.total })
            }
        } else {
            await Cart.updateOne({ _id: userData, "products.productId": productId }, { $pull: { products: { productId: productId } } })

            res.redirect('/cart')
            empty = true
        }
    } catch (error) {
        next(error)
    }
}

const placeOder = async (req, res, next) => {
    try {
        if (req.session.userLogged) {
            const cartData = await Cart.findOne({ userData: req.session.user_id }).populate('products.productId')
            const userData = await User.findOne({ _id: req.session.user_id })
            const cartProductId = cartData.products
            const { totalSalePrice } = cartProductId.reduce((acc, cur) => {
                acc.totalSalePrice += cur.total;
                return acc;
            }, { totalSalePrice: 0 });
            const coupon = await Coupon.findOne({ _id: cartData.coupon })
            let totalPrice;
            let discount;
            let orderSaved
            if (!coupon) {
                totalPrice = totalSalePrice;
                const order = new Order({
                    userId: req.session.user_id,
                    productData: cartProductId,
                    peymentMethod: req.body.peymentMethod,
                    addressId: req.body.selectAddress,
                    cartTotal: totalSalePrice,
                    dicountTotal: totalPrice,
                    status: "placed",
                    paymentStatus: "pending",

                })
                orderSaved = await order.save()
            } else {
                if (coupon.couponType == 'Percentage') {
                    let couponPersantage = coupon.discountPrice
                    let discount = (totalSalePrice / 100) * couponPersantage;
                    if (discount > coupon.maxDiscount) {
                        discount = coupon.maxDiscount
                    }
                    totalPrice = totalSalePrice - discount
                } else {
                    totalPrice = totalSalePrice - coupon.discountPrice
                    discount = coupon.discountPrice
                }

                const order = new Order({
                    userId: req.session.user_id,
                    productData: cartProductId,
                    peymentMethod: req.body.peymentMethod,
                    addressId: req.body.selectAddress,
                    cartTotal: totalSalePrice,
                    dicountTotal: totalPrice,
                    status: "placed",
                    paymentStatus: "pending",
                    couponCode: coupon.coupon,
                    couponDiscount: discount
                })
                orderSaved = await order.save()

                await Coupon.updateOne({ _id: coupon._id }, { $push: { userId: req.session.user_id } })
                await Coupon.updateOne({ _id: coupon._id }, { $inc: { minUser: -1 } })
            }


            req.session.orderId = orderSaved._id
            if (orderSaved.peymentMethod == "UPI Payment ") {
                instance.orders.create({
                    amount: parseInt(totalPrice) * 100,
                    currency: "INR",
                    receipt: orderSaved._id.toString(),
                }).then((order) => {
                    console.log(order);
                    res.json({ order: order, user: userData });
                })
            } else {
                res.json({ success: true })

            }
        } else {
            res.redirect('/')
        }
    } catch (error) {
        next(error)
    }
}
const verifyPayment = async (req, res, next) => {
    try {
        let details = req.body
        let hmac = crypto.createHmac('sha256', '62lkO3Er8KxIoZiWkRmqYwRE')
        hmac.update(details['order[razorpay_order_id]'] + '|' + details['order[razorpay_payment_id]'])
        hmac = hmac.digest("hex")
        if (hmac == details['order[razorpay_signature]']) {
            await Order.updateOne({ _id: details['payment[receipt]'] }, {
                $set: {
                    paymentStatus: 'Payment completed'
                }
            })
            res.json({ success: true })
        } else {
            await Order.updateOne({ _id: details['payment[receipt]'] }, {
                $set: {
                    paymentStatus: 'Payment Failed'
                }
            })
            res.json({ success: false })
        }
    } catch (error) {
        console.log(error.message)
    }
}

const orderList = async (req, res, next) => {
    try {
        const orderDetails = await Order.find({ userId: req.session.user_id })
        const userData = await User.findOne({ _id: req.session.user_id })
        res.render('orderList', { orderDetails, userData })
    } catch (error) {
        next(error)
    }
}

const orderView = async (req, res, next) => {
    try {
        const productDetails = await Order.findOne({ _id: req.query.id }).populate({ path: 'productData', populate: 'productId' })
        const userData = await User.findOne({ _id: req.session.user_id })
        const produts = productDetails.productData
        res.render('orderView', { produts, productDetails, userData })
    } catch (error) {
        next(error)
    }
}

const insertWishList = async (req, res, next) => {
    try {
        const productData = await Product.findById({ _id: req.query.id })

        const UserId = await wishList.findOne({ userData: req.session.user_id })

        const product = {
            productId: productData._id,
        }

        if (UserId) {
            let proExit = UserId.products.findIndex(product => product.productId == req.query.id)

            if (proExit != -1) {
                res.json({ success: false })
            } else {
                await wishList.findByIdAndUpdate({ _id: UserId._id }, { $push: { products: product } })
                res.json({ success: true })
            }
        } else {
            const data = new wishList({
                products: product,
                userData: req.session.user_id,
            })

            const cartData = await data.save();

            res.json({ success: true })
        }
    } catch (error) {
        next(error)
    }
}
const loadWishlist = async (req, res, next) => {
    try {
        if (req.session.userLogged == true) {
            const userCart = await wishList.findOne({ userData: req.session.user_id }).populate('products.productId')
            const userData = await User.findOne({ _id: req.session.user_id })
            if (userCart) {
                const wishData = userCart.products
                res.render('wishList', { wishData, userData })
            } else {
                let wishData = []
                res.render('wishList', { wishData, userData })
            }

        } else {
            res.render('wishList')
        }
    } catch (error) {
        next(error)
    }
}

const removePro = async (req, res, next) => {
    try {
        await wishList.updateOne({ userData: req.session.user_id, "products.productId": req.query.id }, { $pull: { products: { productId: req.query.id } } })

        res.redirect('/wishList')
    } catch (error) {
        next(error)
    }
}

const moveToCart = async (req, res, next) => {
    try {
        const productData = await Product.findById({ _id: req.query.id })
        const UserId = await Cart.findOne({ userData: req.session.user_id })
        const wishData = await wishList.findOne({ userData: req.session.user_id })

        const product = {
            productId: productData._id,
            quantity: 1,
            total: productData.salePrice
        }

        if (UserId) {
            let proExit = UserId.products.findIndex(product => product.productId == req.query.id)
            if (proExit != -1) {

                await Cart.updateOne({ userData: req.session.user_id, 'products.productId': req.query.id },
                    {
                        $inc: { 'products.$.quantity': 1, 'products.$.total': productData.salePrice, total: productData.salePrice }
                    })

                const remPro = wishData.products.findIndex(product => product.productId == req.query.id)
                wishData.products.splice(remPro, 1)
                await wishData.save()

                res.redirect('/cart')
            } else {
                await Cart.findByIdAndUpdate({ _id: UserId._id }, { $push: { products: product } })
                console.log(req.query.id)

                const remPro = wishData.products.findIndex(product => product.productId == req.query.id)
                wishData.products.splice(remPro, 1)

                await wishData.save()

                res.redirect('/cart')
            }
        } else {
            const cart = new Cart({
                products: product,
                userData: req.session.user_id,
                total: productData.salePrice
            })
            await cart.save()

            res.redirect('/cart')
        }
    } catch (error) {
        console.log(error.message)
    }
}

const cancelOrder = async (req, res, next) => {
    try {
        await Order.findByIdAndUpdate({ _id: req.query.id }, { $set: { status: "Cancelled" } })

        res.redirect('/OrderList')
    } catch (error) {
        next(error)
    }
}

const returnOrder = async (req, res, next) => {
    try {
        await Order.findByIdAndUpdate({ _id: req.query.id }, { $set: { status: "Returned" } })
        await Order.findByIdAndUpdate({ _id: req.query.id }, { $set: { paymentStatus: "Refunded" } })
        res.redirect('/OrderList')
    } catch (error) {
        next(error)
    }
}

const orderConfirmation = async (req, res, next) => {
    try {
        const userData = await User.findOne({ _id: req.session.user_id })
        const orderData = await Order.findOne({ _id: req.session.orderId })
        const addressId = orderData.addressId.toString()
        const date = orderData.date.toISOString().split('T')[0];
        const cartDeails = await Cart.findOne({ userData: req.session.user_id }).populate('products.productId')
        const productIds = cartDeails.products
        productIds.forEach(async (product) => {
            await Product.updateOne({ _id: product.productId._id }, { $inc: { quantity: -(product.quantity) } })
        })

        const cartData = await Cart.deleteOne({ userData: req.session.user_id })
        const address = userData.address.find((item) => item._id == addressId)
        console.log(cartData);

        res.render('orderConfirmation', { userData, orderData, address, date })
    } catch (error) {
        next(error)
    }
}

const applyCoupon = async (req, res, next) => {
    try {
        const orderData = await Cart.findOne({ userData: req.session.user_id })
        const cartProductId = orderData.products
        const { totalSalePrice } = cartProductId.reduce((acc, cur) => {
            acc.totalSalePrice += cur.total;
            return acc;
        }, { totalSalePrice: 0 });
        const couponApplied = await Cart.findOne({ $and: [{ userData: req.session.user_id }, { coupon: { $exists: true, $ne: null } }] })
        if (!couponApplied) {
            const couponData = await Coupon.findOne({ coupon: req.body.coupon })
            if (couponData) {
                const date = new Date()
                const expiryDate = new Date(couponData.ExpiryDate)
                const userData = await Coupon.findOne({ $and: [{ coupon: req.body.coupon }, { userId: { $in: [req.session.user_id] } }] })
                console.log(userData);
                if (userData) {
                    res.json({ success: true, userData: true })
                } else if (couponData.minUser == 0) {
                    res.json({ success: true, message: true })
                } else if (expiryDate < date) {
                    res.json({ success: true, expired: true })
                } else if (totalSalePrice < couponData.minPrice) {
                    res.json({ success: true, minPrice: true, max: couponData.minPrice })
                } else {

                    res.json({ success: true, coupon: couponData })
                    await Cart.updateOne({ userData: req.session.user_id }, {
                        $set: { coupon: couponData._id }
                    }, { upsert: true })
                }
            } else {
                res.json({ success: false })
            }
        } else {
            res.json({ success: false, applied: true })
            await Cart.updateOne({ userData: req.session.user_id }, { $unset: { coupon: "" } })
        }

    } catch (error) {
        next(error)
    }
}

const changePass = async (req, res, next) => {
    try {
        const userData = await User.findOne({ _id: req.session.user_id })

        const passwordMatch = await bcrypt.compare(pass, userData.password)

        if (passwordMatch) {
            const regex = /^(?=.*[@$!%*?&#+-])[@$!%*?&#+-\w]*$/;


            if (req.body.NewPass.match(regex)) {
                if (req.body.NewPass.length <= 8) {
                    res.render('userProfile', { pmessage: "Password must contain 8 charactor", userData })
                } else if (req.body.NewPass != req.body.confirmPass) {
                    res.render('userProfile', { message: "Passwords are Not Same", userData })

                } else {
                    const newPassword = await bcrypt.hash(req.body.NewPass, 10)
                    await User.updateOne({ _id: req.session.user_id }, { $set: { password: newPassword } })
                    res.redirect('/userProfile')
                }
            } else {
                res.render('userProfile', { Pmessage: "Password must contain at least one special character", userData })
            }
        } else {
            res.render('userProfile', { Vmessage: "Current password is not match", userData })
        }
    } catch (error) {
        console.log(error.messsage);
    }
}

const categoryFilter = async (req, res, next) => {
    try {

        let sort = {};
        if (req.body.sort == "lowTohigh") {
            sort.salePrice = 1
        } else if (req.body.sort == "highTolow") {
            sort.salePrice = -1
        }
        let productData;
        if (req.body.id == "all") {
            productData = await Product.find({}).sort(sort)
        } else {
            productData = await Product.find({ category: req.body.id }).sort(sort)
        }

        res.json(productData)


    } catch (error) {
        next(error)
    }
}


module.exports = {
    loadRegister,
    insertUser,
    loadLogin,
    loadHome,
    verifyLogin,
    loadOtpPage,
    loadAbout,
    loadCart,
    loadContact,
    loadShop,
    productView,
    getOtp,
    loadOtpPgae,
    verifyOtp,
    resendOtp,
    loadland,
    cartLand,
    userLogout,
    otppageLoad,
    verifySignUp,
    insertCart,
    loadCheckout,
    loadUserProfile,
    loadUserAddress,
    addAddress,
    userEdit,
    deleteAddress,
    updateUser,
    deleteProductCart,
    addressEdit,
    uploadEdit,
    changeQuantity,
    placeOder,
    orderList,
    orderView,
    loadWishlist,
    insertWishList,
    removePro,
    moveToCart,
    cancelOrder,
    orderConfirmation,
    verifyPayment,
    applyCoupon,
    returnOrder,
    changePass,
    categoryFilter,
    resendOtpSignup,



}