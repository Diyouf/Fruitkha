const User = require('../model/userModel')
async function errorHandler(err, req, res, next) {
  console.error(err.stack);
  const userData = await User.findOne({ _id: req.session.user_id }) 
  if (req.session.userLogged) {
    res.status(404).render('404page',{userData})
  } else {
    res.status(404).render('404page')
  }
  next()

}

module.exports = {
  errorHandler
}