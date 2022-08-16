const express = require ('express');
const mongoose = require('mongoose');
const Registeruser = require('./model');
const jwt = require('jsonwebtoken');
const middleware = require('./middleware');
const cors = require('cors');
const Msgmodel = require('./Msgmodel');
require("dotenv").config();


const app = express();

mongoose.connect("mongodb+srv://aravindsignin:aravind123@cluster0.sfwun.mongodb.net/?retryWrites=true&w=majority")
.then(
()=>
    console.log('DB connection established')
)

app.use(express.json());
app.use(cors({origin:"*"}))

app.post('/register', async (req,res) =>{
    try{
              const{username, email, password, confirmpassword} = req.body;
              let exist = await Registeruser.findOne({email})
              if(exist){
                return res.status(400).send('User Already Exist')
              }
              if(password !== confirmpassword){
                return res.status(400).send('passwords are not matching')
              }
              let newUser = new Registeruser({
                username,
                email,
                password,
                confirmpassword
              })
              await newUser.save();
              res.status(200).send('Registered successfully')
    }
    catch(err){
               console.log(err)
               res.status(500).send('Internal server error')
    }
})

app.post('/login', async (req, res) =>{
    try{
        const {email, password} = req.body;
        let exist = await Registeruser.findOne({email});
        if(!exist){
            return res.status(400).send('User Not Found');
        }
        if(exist.password !== password){
            return res.status(400).send('Invalid Credentials');
        }
        let payload ={
            user:{
                id: exist.id
            }
        }
        jwt.sign(payload, 'jwtSecret', {expiresIn: 100000},
            (err, token)=>{
                if(err) throw err;
                return res.json({token})
                
            }
        )

    }
    catch(err){
        console.log(err);
        return res.status(500).res.send('server error')
    }
})

app.get('/myprofile', middleware, async(req, res) =>{
    try{
         let exist = await Registeruser.findById(req.user.id)
         if(!exist){
            return res.status(400).send('User Not Found')
         }
         res.json(exist);
    }
    catch(err){
        console.log(err);
        return res.status(500).res.send('server error')
    }
})

app.listen(process.env.PORT || 5000, ()=>{
    console.log('Server running...')
}
)

app.post('/addmsg', middleware, async(req, res) => {
    try{
        const {text} = req.body;
        const exist = await Registeruser.findById(req.user.id)
        let newmsg = new Msgmodel({
            user: req.user.id,
            username: exist.username,
            text
        })
        await newmsg.save();
        let allmsg = await Msgmodel.find();
        return res.json(allmsg)
   }
   catch(err){
       console.log(err);
       return res.status(500).res.send('server error')
   }

})

app.get('/getmsg', middleware, async(req, res)=>{
    try{
        let allmsg = await Msgmodel.find();
        return res.json(allmsg)
    }
    catch(err){
        console.log(err);
        return res.status(500).res.send('server error')
    }
})