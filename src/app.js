const express = require("express");
const path = require("path");
const hbs = require("hbs");
const brcypt = require("bcryptjs");
const bcrypt = require("bcryptjs/dist/bcrypt");
var nodemailer = require('nodemailer');

const app = express();

require("./db/connect")
const Register = require("./models/registers")
const { json } = require("express");
const async = require("hbs/lib/async");
const PORT = process.env.PORT || 3000;




// Way to Public folder   --  Indwx.html file to be deleted
const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partial_path = path.join(__dirname, "../templates/partials");
// console.log(path.join(__dirname, "../public"))
console.log(path.join(__dirname, "----> dirname"))

// To get data from form
app.use(express.json());
app.use(express.urlencoded({extended: false}))


app.use(express.static(static_path));
// Setting view engine
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partial_path);



// Send Mail

// const sendMail = (getEmail, getFirstname, randomNum)=>{
const sendMail = (getEmail, randomNum)=>{
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
        subject: 'Sending Email using Node.js',
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








// To use Handlebars
app.get("/", (req, res)=>{
    // res.render("index");


    res.render("verify");
})

app.post("/otp", (req, res)=>{  
    console.log("OTP here")
    console.log(req.body.email)
    email = req.body.email
    var randomNum = Math.floor(Math.random() * 100000) 
    console.log(randomNum)

    sendMail(email, randomNum)

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

            // Saving into database
            const registered = await registerEmployee.save();
            console.log(registered)
            console.log(registered.email)
            console.log(registered.firstname)
            // console.log(req.body.registered);
            // res.send(registered);


            sendMail(registered.email,registered.firstname, randomNum)

            res.status(201).render("index");
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

        // res.send(`Email is ${userFilled_email} and password is ${userFilled_password}`)
        // res.send(useremail.password);
        /* res.send(useremail.password);
        console.log(useremail);
        */

        // if(useremail.password === userFilled_password){
        if(isMatch){
            // res.render("index");
            res.status(201).render("index");
        }else{
            // res.send("Passwords don't match!")
            res.send("Invalid Password Credentials!")
        }

    }catch(err){
        // res.status(400).send("Invalid Email!")
        res.status(400).send("Invalid Login Credentials!")
    }
})


app.listen(PORT, ()=>{
    console.log(`Server is running at port number ${PORT}`)
})