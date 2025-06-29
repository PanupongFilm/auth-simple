const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const passwordComplexity = require('joi-password-complexity');
const bcrypt = require("bcrypt");

//Define the user collection structure for adding to database
const userSchema = mongoose.Schema({

    firstName: {type: String , required: true},
    lastName: {type: String , required: true},
    email: {type: String , required: true, unique: true},
    password: {type: String , required: true},

});

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({_id:this._id},process.env.JWTPRIVATEKEY, {expiresIn: "300s"});
    return token;
}

const SALT_FACTOR = 10;
userSchema.pre('save' , async function(next){

    if(!this.isModified('password')) return next();

    try{
        
        const salt = await bcrypt.genSalt(SALT_FACTOR);
        const hashedPassword = await bcrypt.hash(this.password,salt);
        this.password = hashedPassword;
        console.log('Hash Passoword succuessful');
        next();
    

    }catch(err){
        console.error("Hashed password was failed");
        next(err);
    }
});

userSchema.methods.comparePassword = async function(password){
    try{
        const isMatch = await bcrypt.compare(password,this.password);
        return isMatch;

    }catch(err){
        console.error("Compared Failed");
        throw err;
    }
}

const User = mongoose.model("User",userSchema);


// Validation input form user

const validation = (data) =>{ //data ที่รับมาคือ {firstName, lastName , email, password}

    const schema = Joi.object({
        firstName: Joi.string().required().label("First Name"),
        lastName: Joi.string().required().label("Last Name"),
        email: Joi.string().email().required().label("Email"),
        password: passwordComplexity().required().label("Password")
    });
    return schema.validate(data);
};

module.exports = { User , validation};