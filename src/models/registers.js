const mongoose = require("mongoose");
// const brcypt = require("bcryptjs");
const bcrypt = require("bcryptjs/dist/bcrypt");
const jwt = require("jsonwebtoken")



const employeeSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required: true
    },
    lastname:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required: true,
        unique:true
    },
    phone:{
        type:Number,
        required: true,
        unique: true
    },
    age:{
        type:Number,
        required: true
    },
    password:{
        type:String,
        required: true
    },
    cpassword:{
        type:String,
        required: true
    },
    

    // Important to Add
    tokens:[{
        token:{
            type:String,
            required: true
        }
    }] 

})


// Middleware
// .methods is used when working with instance

// Generating Token
employeeSchema.methods.generateAuthToken = async function(){
    try{
        console.log("This is id")
        console.log(this._id)
        // const token = jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
        const token = jwt.sign({_id:this._id.toxString()}, "thisisthesecretkeywhichshouldbeatleastXXXIIbitslong");
        console.log(token)
        
        this.tokens = this.tokens.concat({token: token})
        
        await this.save();
        console.log(token);
        return token;
    }catch(err){
        res.send("This is error part "+ err);
        console.log("This is error part "+ err);
    }
}





// const brcypt = require("bcryptjs");
// const bcrypt = require("bcryptjs/dist/bcrypt");

// const securePassword = async(password) =>{
//     const passwordHash = await bcrypt.hash(password, 10);
//     console.log(passwordHash);
    
//     const passwordCompare = await bcrypt.compare(password, passwordHash);
//     console.log(passwordCompare);

// }

// securePassword("Prashik12345!")



// Convertion of password into hashcode
employeeSchema.pre("save", async function(next){
    
    if(this.isModified("password")){
    // const passwordHash = await bcrypt.hash(password, 10);
    console.log(`The current password is ${this.password}`);
    // If next() not added, the program will be running indefinitely
    this.password = await bcrypt.hash(this.password, 10)
    // const isMatch = await bcrypt.compare(password, useremail.password);

    console.log(`Password after hashing is ${this.password}`);
    
    // this.cpassword = undefined;
    }
    next();
})

// Creating collection  --> Defining Model --> Since, a class, first letter always capital
const Register = new mongoose.model('Register', employeeSchema)                 // Register is the collection names

module.exports = Register;