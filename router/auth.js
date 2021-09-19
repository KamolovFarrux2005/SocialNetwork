const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user')
const verify = require('../verifytoken')
const Joi = require('joi');
router.get('/signup', (req, res) => {
      res.render('signup');
})

router.post('/signup', async(req, res) => {
    const {Username, Email, Password} = req.body;
    const schema = Joi.object({
        Username: Joi.string().min(2).max(26).required(),
        Email: Joi.string().email().min(7).max(26).required(),
        Password: Joi.string().min(6).max(26).required()
    })

    const {error} = schema.validate(req.body)
    if(error) return console.error(error);

    const emailValidate  = await User.findOne({Email: Email})
    if(emailValidate) return console.log('bunday foydalanuvchi bor');

    const salt = await bcrypt.genSalt(10);
    const pswHash = await bcrypt.hash(Password, salt)
    const user = new User({
        Username: Username,
        Email: Email,
        Password: pswHash
    });
    await user.save()
     res.redirect('login');
 });


 router.get('/login', (req, res) => {
    res.render('signin')
 });

router.post('/login', async(req, res) => {
    const {Email, Password} = req.body;
    const schema = Joi.object().keys({
        Email: Joi.string().min(7).email().required(),
        Password: Joi.string().min(6).required()
    });
    
     const {error} = schema.validate(req.body);
      if(error) return console.log(error.message) 

      const ValidEmail = await User.findOne({Email: Email})
      if(!ValidEmail) return console.log('bunday foydalanuvchi mavjud emas')

      const ValidPass = await bcrypt.compare(Password, ValidEmail.Password)
      if(!ValidPass) return console.log('email yoki password xato!')
      const token = jwt.sign({_id: ValidEmail._id}, process.env.JWTSECRET,{expiresIn: '1h'})
      res.cookie("token",token,{
        httpOnly: true
      })
      console.log(token)
      return res.redirect('/home');
});


router.get('/signout', (req, res)=>{
    res.clearCookie('token').redirect('/auth/signup')
})



module.exports = router;