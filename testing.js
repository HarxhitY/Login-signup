import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

mongoose
  .connect("mongodb://127.0.0.1:27017/backend", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected"))
  .catch((error) => console.log("Error connecting to database:", error));

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

const app = express();

app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const decoded = Jwt.verify(token, "qwertyuiop");
    console.log(decoded);
    req.user = await User.findById(decoded._id); // Assuming you want to fetch the user from the database and store it in req.user
    next();
  } else {
    res.redirect("/login");
  }
};

app.get("/", isAuthenticated, (req, res) => {
  //console.log(req.user);
  res.render("logout", {name: req.user.name});
});

app.get("/login", (req, res)=>{
  res.render("login");
});

app.get("/register", (req, res)=>{
  res.render("register");
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  let user = await User.findOne({ email });

  if (!user) return res.redirect("/register");

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch)
    return res.render("login", { email, message: "Incorrect Password" });

  const token = Jwt.sign({ _id: user._id }, "qwertyuiop");

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});

// app.post("/register", async (req, res) => {
//   const { name, email, password } = req.body;

//   let user = await User.findOne({email});
//   if(user){
//     return res.redirect("/login");
//   }

//   user = await User.create({
//     name,
//     email,
//     password,
//   });

//   const token = Jwt.sign({ _id: user._id }, "qwertyuiop");
//   //console.log(token);

//   res.cookie("token", token, {
//     expires: new Date(Date.now() + 90 * 1000),
//     httpOnly: true,
//   });
//   res.redirect("/");
// });


app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  let user = await User.findOne({ email });
  if (user) {
    return res.redirect("/login");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const token = Jwt.sign({ _id: user._id }, "qwertyuiop");

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});


app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.redirect("/");
});

app.listen(5000, () => {
  console.log("Server is running");
});
