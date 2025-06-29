const mongoose = require('mongoose');
const bcrypt =require('bcrypt');
const crypto = require('crypto');


const refreshTokenSchema = mongoose.Schema({

    token: { type: String , required: true, unique: true},
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {type:Date , default: Date.now},
    expiresAt:{type:Date, required: true},
});

refreshTokenSchema.statics.generateRefreshToken = function(){
    return crypto.randomBytes(64).toString('hex');
}

refreshTokenSchema.pre("save",async function (next){

    if(!this.isModified('token')) return next();

    try{
        const salt = await bcrypt.genSalt(10);
        const hashedToken = await bcrypt.hash(this.token,salt);
        this.token = hashedToken;
        console.log("Refresh Token Hashed Completely");
        next();

    }catch(err){
        console.log("Hashed Refresh Token Failed");
        next(err);
    }
});

refreshTokenSchema.methods.compareRefreshToken = async function(token){
    try{
        const isMatch = await bcrypt.compare(token,this.token);
        return isMatch;

    }catch(err){
        console.log("Compare Refresh Token Failed");
        throw err;
    }
}



refreshTokenSchema.index(
    {expiresAt: 1},
    {expireAfterSeconds:0});



module.exports = mongoose.model("RefreshToken",refreshTokenSchema);