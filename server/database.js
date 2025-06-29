const mongoose = require('mongoose');

module.exports = async () =>{
    try{
        await mongoose.connect(process.env.DATABASE_KEY)
        console.log("Connected to database successfully")
    }
    catch(error){
        console.error("Database connected error" + error);
        process.exit(1);
    }
}