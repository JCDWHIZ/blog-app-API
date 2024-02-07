const router = require('express').Router()
const User =  require('../models/User')
// const bcrypt = require('bcrypt')
// to register users

router.post('/register', async (req, res)=>{
    try{
        // const salt = await bcrypt.genSalt(10)
        // const hashedPass = await bcrypt.hash(req.body.password, salt)
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            // password: hashedPass,
        })

        const user = await newUser.save()

        res.status(200).json(user)
    }catch(err){
        res.status(500).json(err)
    }
})


// TO LOGIN USERS

router.post('/login', async (req, res)=>{
    try{
        const user = await User.findOne({username: req.body.username})
        // can be email instead
        !user && res.status(400).json('Invalid Credentials!')
        
        const validated = user.password
        !validated && res.status(400).json('Invalid Credentials!')


        const {password, ...info} = user._doc;
        res.status(200).json(info)
    } 
    catch(err){
        res.status(500).json('Something went wrong')
    }
})

module.exports = router