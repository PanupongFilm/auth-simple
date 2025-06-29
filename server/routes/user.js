const router = require('express').Router();
const {User, validation} = require('../model/user');

router.post("/register",async(req,res)=>{
    try{

        const {error} = validation(req.body);
        if(error){
            return res.status(400).send({message: error.details[0].message});
        }

        const user = await User.findOne({email: req.body.email}); //ในกรณีเผื่ออีเมลซํ้า
        if(user){
            return res.status(409).send({message: "User with given email already exists"});
        }

        await new User(req.body).save();
        res.status(201).send({message: "User created successfully"});

        
    }catch(err){
        console.error("Error from /server/routes/user.js at post('/): " + err);
        res.status(500).send({message: 'Internal Server Error'})
    }

});



module.exports = router;