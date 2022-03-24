const mongoose = require("mongoose");


mongoose.connect("mongodb://localhost:27017/Auth", 
                { useNewUrlParser: true, 
                  useUnifiedTopology: true,
                  // useCreateIndex: true,
                  // useFindAndModify: true
                })
        .then(()=> console.log("connection Successful!"))
        // We use catch to show error
        .catch((err) => console.log(err)
        );