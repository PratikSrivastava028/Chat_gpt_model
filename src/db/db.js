const mongoose = require('mongoose');
require('dotenv').config();

async function connectToDb(){
    try{
        await mongoose.connect(process.env.Mongo_URL)
        console.log("connected to DB");
        
    }
    catch(err){
        console.log("not connected to DB");
        
    }
    
}
module.exports = connectToDb