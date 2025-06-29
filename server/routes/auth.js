const router = require('express').Router();
const Joi = require('joi');
const { User } = require('../model/user');
const RefreshToken = require('../model/refreshToken');
const cookieParser = require('cookie-parser');
const authMiddleware = require('../middleware/auth');

router.use(cookieParser());

router.post('/login', async (req, res) => {
    try {
        const {error} = validation(req.body);
        if(error){
            return res.status(400).send({message: error.details[0].message});
        }

        const user = await User.findOne({email: req.body.email});
        if(!user){
            return res.status(401).send({message: "Invalid Email or Password"});
        }

        const isMatch = await user.comparePassword(req.body.password);

        if(!isMatch){
            return res.status(401).send({message: "Invalid Email or Password"});
        }

        await RefreshToken.deleteMany({userId: user._id}) // ลบ Tokenเดิม

        const refreshToken = RefreshToken.generateRefreshToken();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await new RefreshToken({
            token: refreshToken,
            userId: user._id,
            expiresAt: expiresAt
        }).save();

        const token = await user.generateAuthToken(); 

        res.cookie('refreshToken',refreshToken,{
            httpOnly: true,
            //secure: process.env.NODE_ENV === 'production' รอDeployจริงถึงจะใช้
            sameSite: 'strict', // CSRF Prevention
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).send({accessToken:token,message: "Logged in successfully"});

    }
    catch (err) {
        console.error("Error at /server/routes/auth.js at post('/)");
        return res.status(500).send({ message: "Internal server error" });
    }
})


const validation = (data) => {

    const schema = Joi.object({
        email: Joi.string().email().required().label("Email"),
        password: Joi.string().required().label('Password')
    });
    return schema.validate(data);
}


router.post('/logout',authMiddleware,async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id });

    if (!user) {
      return res.status(401).send({ message: "Invalid user" });
    }

    await RefreshToken.deleteMany({ userId: user._id });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'strict',
      // secure: true // เปิดเมื่อใช้ https จริง
    });

    res.status(200).send({ message: 'Logged out successfully' });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).send({ message: "Internal server error" });
  }
});



router.post('/refresh-token', authMiddleware ,async (req,res)=>{
    try{

        const currentToken = req.cookies.refreshToken;
        if(!currentToken){
            return res.status(401).send({message: "invalided token"});
        }

        const currentRefreshTokenDatabase = await RefreshToken.find({userId: req.user._id});
        if(!currentRefreshTokenDatabase.length){
            return res.status(401).send({message: "Not found refresh token from database"})
        }

        for(const token of currentRefreshTokenDatabase){
            const valid = await token.compareRefreshToken(currentToken);
            if(valid){
                
                const user = await User.findOne({_id: req.user._id});
                const newValidToken = await user.generateAuthToken();
                return res.status(200).send({accessToken:newValidToken,message: "Logged in successfully"});

            }
        }

         return res.status(401).send({message: "Not found refresh token from database"})

    }catch(err){
        console.error("Error from /server/routes/auth.js at /refresh-token")
        res.status(401).send({ message: "Refresh Token has expired. Please log in again." });
    }
});

router.post('/product',authMiddleware, (req,res,next)=>{
    res.send("Product Page");
});


module.exports = router;