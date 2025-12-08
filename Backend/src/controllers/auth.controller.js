const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');  
require('dotenv').config();

async function registerUser(req,res){
const {fullName:{firstName,lastName},email,password} = req.body;

const userAlreadyExist = await userModel.findOne({email});
if(userAlreadyExist){
    return res.status(400).json({
        message: "User Already Exist."
    });
}

const hashPassword = await bcrypt.hash(password,10);

const user = await userModel.create({
    fullName:{
        firstName,lastName
    },
    email,
    password:hashPassword
})
const token = jwt.sign({id:user._id},process.env.JWT_SECRET);

res.cookie("token",token);

res.status(201).json({
    message:"User Registered Successfully",
    user:user.email,
    token
})
}

async function loginController(req,res){
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, sameSite: 'lax' });
    res.status(200).json({
        message: "Logged in successfully",
        user: {
            email: user.email,
            _id: user._id,
            fullName: user.fullName
        }
    });

}


module.exports = {
    registerUser,loginController
}