const express = require("express");
const path = require("path");
const hbs = require("hbs");
const brcypt = require("bcryptjs");
const bcrypt = require("bcryptjs/dist/bcrypt");
var nodemailer = require('nodemailer');

const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const auth = require("./middleware/auth")

const app = express();

require("./db/connect")
const Register = require("./models/registers")
const { json } = require("express");
const async = require("hbs/lib/async");

const { cookie } = require('express/lib/response');


const PORT = process.env.PORT || 3000;




// Way to Public folder   --  Indwx.html file to be deleted
const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partial_path = path.join(__dirname, "../templates/partials");
// console.log(path.join(__dirname, "../public"))
console.log(path.join(__dirname, "----> dirname"))

// To get data from form
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({extended: false}))


app.use(express.static(static_path));
// Setting view engine
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partial_path);



// Send Mail

// const sendMailForSignup = (getEmail, getFirstname, randomNum)=>{
const sendMailForSignup = (getEmail, randomNum)=>{
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'prashik.ganer123@gmail.com',
          pass: 'prashik12345'
        }
      });
      
      var mailOptions = {
        from: 'prashik.ganer123@gmail.com',
        to: getEmail,
        subject: 'Your Email validation code',
        // text: 'Hello' + getFirstname + ', welcome to Senselive. Thanks for signing up! Your 1 time password is '+ randomNum +'.'
        text: randomNum + ' is your One Time Password. Use it validate your your email with SenseLive.'
        // text: 'Hello' + getFirstname + ', welcome to Senselive. Thanks for signing up!'
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}

const sendMailForPasswordRecovery = (getEmail, randomNum)=>{
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'prashik.ganer123@gmail.com',
          pass: 'prashik12345'
        }
      });
      
      var mailOptions = {
        from: 'prashik.ganer123@gmail.com',
        to: getEmail,
        subject: 'Your Recovery Password',
        text: 'We received a request to reset your Senselive dashboard password. Enter the following password reset code: ' + randomNum + '.'
        
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}

z




// To use Handlebars
app.get("/", (req, res)=>{
    // res.render("index");
    res.render("verify");
})


// 'auth' is a middleware
app.get("/secret", auth ,(req, res)=>{
    // Get cookies
    console.log(`This is the cookie content of jwt ---> ${req.cookies.jwt}`)
    res.render("secret");
})

app.get("/logout", auth, async(req, res)=>{
    try {
        console.log(req.user)
       
        /* // req.token --> current token of user
        // To logout current particular user
        
        req.user.tokens = req.user.tokens.filter((current_element)=>{
            return current_element.token !== req.token
        })
        */
        
        // Logout from all devices at once
        req.user.tokens = [];

        res.clearCookie("jwt");
        console.log("Loggedout")
        await req.user.save()
        res.render("login")
    } catch (error) {
        // 500 --> server error
        res.status(500).send(error)
    }
})


app.get("/forgot-password-step-1", (req, res)=>{
    res.render("forgot-password-step-1");
})
app.get("/forgot-password-step-2", (req, res)=>{
    res.render("forgot-password-step-1");
})




app.post("/forgot-password-step-2", async(req, res)=>{
    try{

        recovery_email = req.body.email
        console.log(recovery_email)
        
    const user_object = await Register.findOne({email:recovery_email});
    console.log(user_object)


    
    user_valid = false
    if(user_object == null){
        res.send("Your email is not yet registered!")
        // console.log("Your email is not yet registered!")
    }else{
        
        user_valid = true
        var randomNum = Math.floor(Math.random() * 10000000) 
        console.log(randomNum) 
        sendMailForPasswordRecovery(recovery_email, randomNum)
        res.render("forgot-password-step-2", {recovery_otp: randomNum, otp_verified: true, recovery_email: recovery_email})
        // console.log("You can reset your password!")
    }
    // res.render("forgot-password-step-two");
}catch(err){
    res.send(err)
}
})

app.get("/forgot-password-step-3", (req, res)=>{
    res.render("forgot-password-step-3");
})

app.post("/forgot-password-step-3", (req, res)=>{

    recovery_email = req.body.recovery_email
    real_recovery_otp = req.body.recovery_otp
    user_recovery_otp = req.body.user_filled_code
    console.log(recovery_email)
    console.log(real_recovery_otp)
    console.log(user_recovery_otp)

    recovery_otp_verified = true
    if(user_recovery_otp === real_recovery_otp){
        // res.render("forgot-password-step-3", {recovery_email:recovery_email}); 
        // res.send("otp match!"); 
        console.log("otp match!"); 
        res.render("forgot-password-step-3", {recovery_email: recovery_email, real_recovery_otp: real_recovery_otp, user_recovery_otp: user_recovery_otp});
    }
    else{
        // res.render("forgot-password-step-2", {real_otp:real_otp, user_email:user_email, otp_verified: false})
        console.log("OTP didn't match!"); 
        res.send("OTP didn't match!")
    }



})


app.post("/home", async(req, res)=>{

    const password = req.body.password;
    const cpassword = req.body.cpassword;
    console.log(password)
    console.log(cpassword)

    recovery_email = req.body.recovery_email
    
    
    
    console.log(recovery_email)
    const user_object = await Register.findOne({email:recovery_email});
    console.log("user")
    // console.log(user_object.id)

    // res.send("success")
    
    hashed_password = await bcrypt.hash(password, 10)
    console.log(hashed_password)


    if(password===cpassword){

        const updated_object = await Register.findByIdAndUpdate({_id: user_object.id},
            {
                $set:{
                    new:true,
                    password: hashed_password
                }
            },{
                    useFindAndModify: false
                
            })
           console.log(updated_object)
            res.status(201).render("home", {userFirstname: user_object.firstname});
    }else{
        res.send("Passwords didn't match")
    }
    


})


app.post("/otp", async(req, res)=>{  
    console.log("OTP here")
    console.log(req.body.email)
    email = req.body.email
    var randomNum = Math.floor(Math.random() * 100000) 
    console.log(randomNum)

    const mail = await sendMailForSignup(email, randomNum)
    console.log("mail")
    console.log(mail)

    // res.render("index");
    res.render("otp", {real_otp: randomNum, otp_verified: true, user_email: email}); 
})



app.post("/index", (req, res)=>{  
    
    form_otp = req.body.form_otp
    real_otp = req.body.real_otp
    user_email = req.body.user_email
    console.log(form_otp)
    console.log(real_otp)
    console.log(user_email)

    otp_verified = true
    if(form_otp === real_otp){
        res.render("index", {user_email:user_email}); 
    }
    else{
        res.render("otp", {real_otp:real_otp, user_email:user_email, otp_verified: false})
    }
})





// app.get("/", (req, res)=>{
//     res.send("Hey this is GET request Page")
// })

app.get("/register", (req, res)=>{
    res.render("register");
})




// Create a new user
app.post("/register", async(req, res)=>{
    try{
        // console.log(req.body.firstname);
        // res.send(req.body.firstname);
        var randomNum = Math.floor(Math.random() * 100000) 
        console.log(randomNum) 

        const password = req.body.password;
        const cpassword = req.body.cpassword;

        // text = "Mr Blue has a blue house"
        symbols = "[!@#$%^&*()_+-={};:|,.<>?]+/"
        passwordsym = false
        for(i=0; i<symbols.length; i++){
            x = symbols[i]
            if(password.includes(x)){
                console.log("Password has symbol")
                passwordsym = true
                break
            }
            // else{
            //     console.log("Text does not have symbol")
            // }
        }
        if(passwordsym == false){
            console.log("Password does not have symbol")
        }
        
    // text="Prashik"
    passwordUpper = false
    for(i=0; i<password.length; i++){
        x = password[i]
        x = x.toUpperCase();
        if(x == password[i]){
            console.log("Uppercase present!")
            passwordUpper = true
            break
        }

    }
    if(passwordUpper == false){
        console.log("Password does not uppercase character.")
    }




        if((password===cpassword)&&(passwordsym)&&(passwordUpper)){

            const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                phone: req.body.phone,
                age: req.body.age,
                password: req.body.password,
                // password: password,
                cpassword: req.body.cpassword,
            })

// *****************  TOKEN AUTHENTICATION START *****************

            // Password needs to be hashed

            // Generating JsonToken
            const token = await registerEmployee.generateAuthToken();
            console.log(token)
            
            // The res.cookie() function is used to set the cookie name to value.
            // The value parameter may be a string or object converted to JSON
            // res.cookie(name, value, [options])
            console.log("Before Cookies")
            
            // Storing generated token in web browser using cookies
            res.cookie("jwt", token,{
                
                // Example is College login
                expires: new Date(Date.now()+ 5000),
                httpOnly: true
            });
            // console.log("After Cookies")

            // console.log("cookies" + cookie)
            // res.cookie("jwt", token);
            console.log("cookie")
            console.log(cookie)


// *****************  TOKEN AUTHENTICATION END *****************



            // Saving into database
            const registered = await registerEmployee.save();
            console.log(registered)
            console.log(registered.email)
            console.log(registered.firstname)
            // console.log(req.body.registered);
            // res.send(registered);


            // sendMail(registered.email,registered.firstname, randomNum)

            res.status(201).render("home");
        }
        else
        
        if((passwordUpper == false)||(passwordsym == false)){
            // res.send("Password does not have uppercase charachter");
            res.send("Check Password");
        }
        else
        
        {
            res.send("Passwords don't match");
                    
            // if(passwordsym == false){
            // // console.log("Password does not have symbol")
            //     res.send("Password does not have symbol")
            // }
            }
    
    


    }
    catch(err){
        res.status(400).send(err);
    }
})



app.get("/login", (req, res)=>{
    res.render("login");
})

app.post("/login", async(req, res)=>{
    try{
        const userFilled_email = req.body.email;
        const userFilled_password = req.body.password;

        const useremail = await Register.findOne({email:userFilled_email});
        const isMatch = await bcrypt.compare(userFilled_password, useremail.password);
        console.log(isMatch)


// *****************  TOKEN AUTHENTICATION START *****************

        const token = await useremail.generateAuthToken();
        console.log(token)


        res.cookie("jwt", token,{
                
            // Example is College login
            expires: new Date(Date.now()+ 15000),
            httpOnly: true
        });

// *****************  TOKEN AUTHENTICATION END *****************


        
        // res.send(`Email is ${userFilled_email} and password is ${userFilled_password}`)
        // res.send(useremail.password);
        /* res.send(useremail.password);
        console.log(useremail);
        */

        // if(useremail.password === userFilled_password){
        if(isMatch){
            // res.render("index");
            res.status(201).render("home");
        }else{
            // res.send("Passwords don't match!")
            res.send("Invalid Password Credentials!")
        }

    }catch(err){
        // res.status(400).send("Invalid Email!")
        res.status(400).send("Invalid Login Credentials!")
    }

    // securePassword("Prashik12345!")

// const jwt = require("jsonwebtoken")

// const createToken = async() =>{
//     const token = await jwt.sign({_id:"621327db6f9b6020127566ad"}, "tinyChangesRemarcableResultsAtomicHabits",{
//         expiresIn: "120 seconds"
//     })
//     console.log(token);

//     user_verification = await jwt.verify(token, "tinyChangesRemarcableResultsAtomicHabits")
//     console.log(user_verification)
// }

// createToken();

})


app.listen(PORT, ()=>{
    console.log(`Server is running at port number ${PORT}`)
})