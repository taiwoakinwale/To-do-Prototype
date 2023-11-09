const express = require("express");
const fs = require("fs");

// this is a canonical alias to make your life easier, like jQuery to $.
const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// a common localhost test port
const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
//http://localhost:3000/

function writeTask() {
  fs.writeFileSync(
    __dirname + "/tasks.json",
    JSON.stringify(tasks),
    "utf8",
    (err) => {
      if (err) {
        console.log(err);
        return;
      }
    }
  );
}

function updateTask(taskData) {
  fs.writeFileSync(
    __dirname + "/tasks.json",
    JSON.stringify(taskData),
    "utf8",
    (err) => {
      if (err) {
        console.log(err);
        return;
      }
    }
  );
}

function writeUser() {
  fs.writeFileSync(
    __dirname + "/users.json",
    JSON.stringify(users),
    "utf8",
    (err) => {
      if (err) {
        console.log(err);
        return;
      }
    }
  );
}

//writeUser();
//writeTask();

function readTask() {
  try {
    const data = fs.readFileSync(__dirname + "/tasks.json", "utf8");

    list = JSON.parse(data.toString());

    return list;
  } catch (err) {
    console.error(err);
  }
}

function readUser(index) {
  try {
    const data = fs.readFileSync(__dirname + "/users.json", "utf8");
    list = JSON.parse(data.toString());
    return list;
  } catch (err) {
    console.error(err);
  }
}

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

// User.insertMany(
//   [
//     {
//       _id: 0,
//       username: "first@something.com",
//       password: "example",
//     },
//     {
//       _id: 1,
//       username: "second@something.com",
//       password: "example1",
//     },
//   ],
//   (err) => {
//     if (err) {
//       console.log(err);
//     }
//   }
// );

// Task.insertMany(
//   [
//     {
//       _id: 0,
//       text: "example",
//       state: "unclaimed",
//       creator: "first@something.com",
//       isTaskClaimed: false,
//       claimingUser: null,
//       isTaskDone: false,
//       isTaskCleared: false,
//     },
//     {
//       _id: 1,
//       text: "example 1",
//       state: "unclaimed",
//       creator: "first@something.com",
//       isTaskClaimed: false,
//       claimingUser: null,
//       isTaskDone: false,
//       isTaskCleared: false,
//     },
//     {
//       _id: 2,
//       text: "example 2",
//       state: "claimed",
//       creator: "first@something.com",
//       isTaskClaimed: true,
//       claimingUser: "second@something.com",
//       isTaskDone: false,
//       isTaskCleared: false,
//     },
//     {
//       _id: 3,
//       text: "example 3",
//       state: "unclaimed",
//       creator: "first@something.com",
//       isTaskClaimed: false,
//       claimingUser: null,
//       isTaskDone: false,
//       isTaskCleared: false,
//     },
//     {
//       _id: 4,
//       text: "example 4",
//       state: "claimed",
//       creator: "first@something.com",
//       isTaskClaimed: true,
//       claimingUser: "second@something.com",
//       isTaskDone: true,
//       isTaskCleared: true,
//     }
//   ],
//   (err) => {
//     if (err) {
//       console.log(err);
//     }
//   }
// );

//http://localhost:3000

app.get("/", (req, res) => {
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
app.post("/login", (req, res) => {
  let success = false;
  let userList = readUser()["users"];
  for (var i = 0; i < userList.length; i++) {
    if (
      req.body.loginuser == userList[i].username &&
      req.body.loginpass == userList[i].password
    ) {
      success = true;
      console.log("successful user login.");
      res.render("todo", { username: req.body.loginuser, tasks: readTask() });
    }
  }
  if (!success) {
    console.log("failed user login");
    res.redirect("/");
  }
});

app.post("/register", (req, res) => {
  let success = false;
  let unique = true;
  let userList = readUser()["users"];

  for (var i = 0; i < userList.length; i++) {
    if (req.body.signupuname == userList[i].username) {
      unique = false;
      console.log("username taken.");
      res.redirect("/");
    }
  }

  if (
    req.body.auth == "todo2023" &&
    req.body.signuppass == req.body.signupcpass &&
    unique
  ) {
    success = true;
    users = readUser();
    users["list"].push({
      username: req.body.signupuname,
      password: req.body.signuppass,
    });
    writeUser();
    res.render("todo", { username: req.body.signupuname, tasks: readTask() });
  }

  if (!success) {
    console.log("failed user login");
    res.redirect("/");
  }
});

app.get("/logout", (req, res) => {
  console.log("logout was pushed");
  res.redirect("/");
});

app.post("/addtask", (req, res) => {
  console.log("addtask was pushed");
  let taskList = readTask();

  taskList["tasks"].push({
    _id: taskList["tasks"].length,
    text: req.body.addtasktext,
    state: "unclaimed",
    creator: req.body.username,
    isTaskClaimed: false,
    claimingUser: req.body.username,
    isTaskDone: false,
    isTaskCleared: false,
  });

  updateTask(taskList);

  res.render("todo", { username: req.body.username, tasks: readTask() });
});

app.post("/claim", (req, res) => {
  console.log("claim was pushed");
  let taskList = readTask();

  taskList["tasks"][req.body._id].state =
    "claimed by " + req.body.username + ", unfinished";
  taskList["tasks"][req.body._id].claimingUser = req.body.username;
  taskList["tasks"][req.body._id].isTaskClaimed = true;
  updateTask(taskList);

  res.render("todo", { username: req.body.username, tasks: readTask() });
});
app.post("/abandonorcomplete", (req, res) => {
  console.log("abandonorcomplete");
  let taskList = readTask();

  if (req.body.cbox) {
    taskList["tasks"][req.body._id].state =
      "claimed by " + req.body.username + ", finished";
    taskList["tasks"][req.body._id].isTaskDone = true;
  } else {
    taskList["tasks"][req.body._id].state = "unclaimed";
    taskList["tasks"][req.body._id].isTaskClaimed = false;
    taskList["tasks"][req.body._id].claimingUser = null;
  }

  updateTask(taskList);

  res.render("todo", { username: req.body.username, tasks: readTask() });
});
app.post("/unfinish", (req, res) => {
  console.log("unfinish");
  let taskList = readTask();

  taskList["tasks"][req.body._id].state =
    "claimed by " + req.body.username + ", unfinished";
  taskList["tasks"][req.body._id].isTaskDone = false;
  updateTask(taskList);

  res.render("todo", { username: req.body.username, tasks: readTask() });
});

app.post("/purge", (req, res) => {
  console.log("PURGE");

  let taskList = readTask();
  for (let i = 0; i < taskList["tasks"].length; i++) {
    if (taskList["tasks"][i].isTaskDone == true) {
      taskList["tasks"][i].isTaskCleared = true;
    }
  }

  updateTask(taskList);

  res.render("todo", { username: req.body.username, tasks: readTask() });
});
