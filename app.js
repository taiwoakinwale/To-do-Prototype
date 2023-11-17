const express = require("express");
const fs = require("fs");

const session = require("express-session")
const passport = require("passport")
app.use(express.static("public"));
const passportLocalMongoose = require("passport-local-mongoose")
require("dotenv").config();
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use (passport.initialize());
app.use (passport.session());
app.set("view engine", "ejs");

// a common localhost test port
const port = 3000;

// Bring in mongoose
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/to-do", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//create user schema
const userSchema = new mongoose.Schema({
  _id: Number,
  username: String,
  password: String,
});

// plugins extend Schema functionality
userSchema.plugin(passportLocalMongoose);

//create task schema
const taskSchema = new mongoose.Schema({
  _id: Number,
  text: String,
  state: String,
  creator: String,
  isTaskClaimed: Boolean,
  claimingUser: String,
  isTaskDone: Boolean,
  isTaskCleared: Boolean,
});

//users collection
const User = mongoose.model("User", userSchema);

//tasks collection
const Task = mongoose.model("Task", taskSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

User.insertMany(
  [
    {
      _id: 0,
      username: "first@something.com",
      password: "example",
    },
    {
      _id: 1,
      username: "second@something.com",
      password: "example1",
    },
  ],
  (err) => {
    if (err) {
      console.log(err);
    }
  }
);

Task.insertMany(
  [
    {
      _id: 0,
      text: "example",
      state: "unclaimed",
      creator: "first@something.com",
      isTaskClaimed: false,
      claimingUser: null,
      isTaskDone: false,
      isTaskCleared: false,
    },
    {
      _id: 1,
      text: "example 1",
      state: "unclaimed",
      creator: "first@something.com",
      isTaskClaimed: false,
      claimingUser: null,
      isTaskDone: false,
      isTaskCleared: false,
    },
    {
      _id: 2,
      text: "example 2",
      state: "claimed",
      creator: "first@something.com",
      isTaskClaimed: true,
      claimingUser: "second@something.com",
      isTaskDone: false,
      isTaskCleared: false,
    },
    {
      _id: 3,
      text: "example 3",
      state: "unclaimed",
      creator: "first@something.com",
      isTaskClaimed: false,
      claimingUser: null,
      isTaskDone: false,
      isTaskCleared: false,
    },
    {
      _id: 4,
      text: "example 4",
      state: "claimed",
      creator: "first@something.com",
      isTaskClaimed: true,
      claimingUser: "second@something.com",
      isTaskDone: true,
      isTaskCleared: true,
    }
  ],
  (err) => {
    if (err) {
      console.log(err);
    }
  }
);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
  //http://localhost:3000/
  
//http://localhost:3000

app.get( "/", ( req, res ) => {
    console.log( "A user is accessing the root route using get" );
    res.render("login");
});

//http://localhost:3000/todo
// app.get("/todo", (req, res) => {
//     res.sendFile(__dirname + "/public/todo.html", (err)=> {
//         if (err){
//             console.log(err);
//             return;
//         }
//     });
// });
app.post( "/login", ( req, res ) => {
    console.log( "User " + req.body.username + " is attempting to log in" );
    const user = new User ({
        username: req.body.username,
        password: req.body.password
    });
    console.log(user);
    req.login ( user, ( err ) => {
         if ( err ) {
             console.log( err );
             res.redirect( "/" );
         } else {
            passport.authenticate( 'local', { successRedirect:'/todo',
            failureRedirect: '/' })( req, res, () => {
                res.redirect( "/todo" ); 
            });
         }
    });
});

app.post( "/register", (req, res) => {
    console.log( "User " + req.body.username + " is attempting to register" );
    if(req.body.auth == "todo2023"){
        User.register({ username : req.body.username }, 
                        req.body.password, 
                        ( err, user ) => {
            if ( err ) {
            console.log( err );
                res.redirect( "/" );
            } else {
                passport.authenticate( "local" )( req, res, () => {
                    res.redirect( "/todo" );
                });
            }
        });
    }
    else{
        console.log("auth code invalid");
        res.redirect( "/" );
    }
});

app.get( "/todo", async( req, res ) => {
    console.log("Going to todo");
    if ( req.isAuthenticated() ){
        try {
            console.log( "was authorized" );
            const results = await Task.find();

            res.render( "todo", { username: req.user.username , tasks : results });
        } catch ( error ) {
            console.log( error );
        }
    } else {
        console.log( "was not authorized." );
        res.redirect( "/" );
    }
});

app.get("/logout", (req, res) => {
  console.log("logout was pushed");
  req.logout();
  res.redirect("/");
});

app.post( "/addtask", async( req, res ) => {
    console.log( "User " + req.user.username + " is adding the task:" );

    const results = await Task.find();
    const task = new Task({
        _id: results.length,
        text: req.body.addtasktext,
        state: "unclaimed",
        creator:   req.user.username,
        isTaskClaimed: false,
        claimingUser: null,
        isTaskDone: false,
        isTaskCleared: false,
    });

    task.save();

    res.redirect( "/todo" );
});

app.post("/claim", async(req, res) => {
    console.log(req.body);
    console.log("claim was pushed");
    console.log("task id " + req.body._id);

    await Task.updateOne({_id: req.body._id}, 
        { $set: {
            state: "claimed by "+ req.user.username +", unfinished",
            claimingUser:  req.user.username,
            isTaskClaimed: true,
        }});

    res.redirect( "/todo" );
});

app.post("/abandonorcomplete", async(req, res) => {
    console.log("abandonorcomplete")
  
    if(req.body.cbox){
        await Task.updateOne({_id: req.body._id}, 
            { $set: {
                state: "claimed by "+ req.user.username +", finished",
                isTaskDone: true,
            }});
        res.redirect( "/todo" );
    }
    else{
        await Task.updateOne({_id: req.body._id}, 
            { $set: {
                state: "unclaimed",
                isTaskClaimed: false,
                claimingUser: null
            }});
        res.redirect( "/todo" );
    }
});


app.post("/unfinish", async(req, res) => {
    console.log("unfinish")

    await Task.updateOne({_id: req.body._id}, 
        { $set: {
            state: "claimed by "+ req.body.username +", unfinished",
            isTaskDone: false,
        }});
    res.redirect( "/todo" );
});

app.post("/purge", async(req, res) => {
    console.log("purge")
    const results = await Task.find();
    
    for (let i = 0; i < results.length; i ++){
      if(results[i].isTaskDone == true){
        await Task.updateOne({_id: i}, 
            { $set: {
                isTaskCleared: true,
            }});
      }
    }
  
    res.redirect( "/todo" );
  });