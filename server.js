const express = require('express');
const formidable=require('formidable');
const app=express();
const mongoose=require('mongoose');
const cors=require('cors');
const fs=require('fs');
var multer = require('multer');
const bodyParser = require('body-parser');

const ejs = require('ejs');
const path = require('path');

var Storage = multer.diskStorage({
    destination:"./public/uploads/",
    filename:(req,file,cb)=>{
        cb(null,file.originalname);
    }
});

var upload = multer({storage:Storage}).single('photo');

//connection with mongodb

mongoose.connect('mongodb://localhost:27017/mani',{useNewUrlParser:true})
.then(response=>{
    console.log('DB Connected')
}).catch(err=>console.log("err.message"));


const userSchema=new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true
    },
    mobile:{
        type:String,
        trim:true,
        required:true
    },
    primary:{
        type:String,
        trim:true,
        required:true
    },
    secondary:{
        type:String,
        required:true
    },
    total:{
        type:String,
        required:true
    },
    relevent:{
        type:String,
        trim:true,
        required:true
    },
    currentctc:{
        type:String,
        trim:true,
        required:true
    },
    expected:{
        type:String,
        trim:true,
        required:true
    },
    notice:{
        type:String,
        trim:true,
        required:true
    },
    photo:String

})

const User=mongoose.model('User', userSchema)



//middleware
app.use(bodyParser.json())
app.use(cors())
app.use(bodyParser.urlencoded({extended:false}))


app.post('/userdashboard',upload,(req,res)=>
{
    
    if(req.file)
    {
        if(req.file.size>4000000)
        {
            return res.status(400).json({
                error:"Too long"
            })
        }
         
         const user=new User(req.body) 
        //  user.photo.data=fs.readFileSync(file.photo.path)
        //  user.photo.contentType=file.photo.type
         user.photo='uploads/'+ req.file.originalname
         user.save((err,user)=>{
             if(err)
             {  
                 return res.status(400).json({
                     error:"Not Save in DB"
                 })
             }
             return res.json(user)
         })
    }  
});

const listsSchema={
    name: String,
    mobile:String,
    primary:String,
    secondary:String,
    total:String,
    relevent:String,
    currentctc:String,
    expected:String,
    notice:String,
    photo:String
}
// const User1 = mongoose.model('User',listsSchema);


app.set('view engine','ejs');

app.set("views",path.resolve(__dirname,'views'));

var picPath = path.resolve(__dirname,'public');

app.use(express.static(picPath));

app.use(bodyParser.urlencoded({extended:false}))

app.get('/',(req,res)=>{
    User.find({},function(err, data){
        res.render('index',{
            jobList: data
        })
    })
 })

 app.get('/',(req,res)=>{
    User.find((err,data)=>{
             if(err){
                 console.log(err)
             }
            if(data){
                console.log(data)
                res.render('index',{data:data})
            } 
           else{
               res.render('index',{data:{}})
           } 
    })
    
})

 app.get('/download/:id',(req,res)=>{
    User.find({_id:req.params.id},(err,data)=>{
        if(err){
            console.log(err)
        } 
        else{
            var path="../backend/public/"+data[0].photo;
            res.download(path);
        }
    })
})

if(process.env.NODE_ENV="production"){
    app.use(express.static("client/build"));
}

const port = process.env.PORT || 4000 ;
app.listen(port,()=>console.log(`server is running at ${port}`))