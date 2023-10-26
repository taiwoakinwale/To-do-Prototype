const express = require ( "express" );
const fs = require( "fs" );

// this is a canonical alias to make your life easier, like jQuery to $.
const app = express(); 
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true})); 

// a common localhost test port
const port = 3000;

app.listen (port, () => {
    console.log (`Server is running on http://localhost:${port}`);
});

//http://localhost:3000/
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html", (err)=> {
        if (err){
            console.log(err);
            return;
        }
    });
});

//http://localhost:3000/todo
app.get("/todo", (req, res) => {
    res.sendFile(__dirname + "/public/todo.html", (err)=> {
        if (err){
            console.log(err);
            return;
        }
    });
});

app.post("/todo", (req, res) => {
    fs.readFile ( __dirname + "/users.json",
            "utf8", 
            ( err, jsonString ) => {
    if ( err ) {
        console.log("Error reading file from disk:", err);
        return;
    }
    try {
        const users = JSON.parse(jsonString);
        console.log("Json stuff:", users.user);
        console.log("login stuff:", req.body);
        if (users.user.username === req.body.username && users.user.password === req.body.password) {
            console.log("login success, sending to todo page");
            res.redirect("/todo")
        }
        else {
            console.log("user failed login, sending back to index")
            res.redirect("/")
        }
    } catch ( err ) {
        console.log("Error parsing JSON:", err);
    }
});


});
  