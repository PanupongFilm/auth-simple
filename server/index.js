require('dotenv').config();
const express =require('express');
const app = express();
const cors =require('cors');
const connection = require('./database');
const PORT = process.env.PORT || 3000;

//middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

//Router
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
app.use('/api',authRouter);
app.use('/api',userRouter);


app.get('/',(req,res)=>{
    res.send("Hello world");
})






startServer();

async function startServer(){
    try{

        await connection();
        app.listen(PORT,()=>{
            console.log(`Server start at port ${PORT}`);
        })

    }
    catch(error){
        console.error("Start server unsuccuessed: " + error);
        process.exit(1);
    }
}