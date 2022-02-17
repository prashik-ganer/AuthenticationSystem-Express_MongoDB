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



// To use Handlebars
app.get("/", (req, res)=>{
    res.render("index");
})

// app.get("/", (req, res)=>{
//     res.send("Hey this is GET request Page")
// })

app.get("/register", (req, res)=>{
    res.render("register");
})


const sendMail = (getPassword, getFirstname)=>{
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'prashik.ganer123@gmail.com',
          pass: 'prashik12345'
        }
      });
      
      var mailOptions = {
        from: 'prashik.ganer123@gmail.com',
        to: getPassword,
        subject: 'Sending Email using Node.js',
        text: 'Hello' + getFirstname + ', welcome to Senselive. Thanks for signing up!'
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}


// Create a new user
app.post("/register", async(req, res)=>{
    try{
        // console.log(req.body.firstname);
        // res.send(req.body.firstname);

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
            sendMail(registered.email,registered.firstname)

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