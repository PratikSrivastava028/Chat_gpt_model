const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
     email:{
        type:String,
        required:true,
        unique:true
    },
    fullName:{
       firstName:{
          type:String,
        required:true,
        unique:true
       },
       lastName:{
          type:String,
        required:true,
        unique:true
       }
    },
    password:{
        required:true,
        type:String
    },
   
});

const userModel = mongoose.model("user", userSchema);

module.exports = userModel