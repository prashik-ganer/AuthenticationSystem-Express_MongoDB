const express = require("express");
const path = require("path")
const hbs = require("hbs")
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

// Create a new user
app.post("/register", async(req, res)=>{
    try{
        // console.log(req.body.firstname);
        // res.send(req.body.firstname)

        const password = req.body.password;
        const cpassword = req.body.cpassword;

        if(password===cpassword){

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


            // Pssword needs to be hashed
            





            // Saving into database
            const registered = await registerEmployee.save();
            console.log()
            console.log(req.body.registered);
            // res.send(registered);

            res.status(201).render("index");
        }else{
            res.send("Passwords don't match");
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
        
        // res.send(`Email is ${userFilled_email} and password is ${userFilled_password}`)
        // res.send(useremail.password);
        /* res.send(useremail.password);
        console.log(useremail);
        */

        if(useremail.password === userFilled_password){
            // res.render("index");
            res.status(201).render("index");
        }else{
            // res.send("Passwords don't match!")
            res.send("Invalid Login Credentials!")
        }

    }catch(err){
        // res.status(400).send("Invalid Email!")
        res.status(400).send("Invalid Login Credentials!")
    }
})

// const brcypt = require("bcryptjs");
// const bcrypt = require("bcryptjs/dist/bcrypt");

// const securePassword = async(password) =>{
//     const passwordHash = await bcrypt.hash(password, 10);
//     console.log(passwordHash);
    
//     const passwordCompare = await bcrypt.compare(password, passwordHash);
//     console.log(passwordCompare);

// }

// securePassword("Prashik12345!")

app.listen(PORT, ()=>{
    console.log(`Server is running at port number ${PORT}`)
})