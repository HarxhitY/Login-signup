import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import Jwt from "jsonwebtoken";


mongoose.connect("mongodb://127.0.0.1:27017/backend", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log("Database connected"))
  .catch((error) => console.log("Error connecting to database:", error));


const userSchema = new mongoose.Schema({
    name: String,
    email: String,
});

const User = mongoose.model("User", userSchema);

const app = express();

app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true })); //will show input on terminal
app.use(cookieParser());

app.set("view engine", "ejs");

const isAuthenticated = async (req, res, next)=>{
  const {cookieValue} = req.cookies;
  if(cookieValue){
      const decoded = Jwt.verify(cookieName ,"qwertyuiop");
      console.log(decoded);
      req.user = await User.findById(decoded._id);

      next();
  }else{
      res.render("login");
  }
};

app.get("/", (req, res)=>{
  const {cookieName} = req.cookies;
  //console.log(cookieName);
  if(cookieName){
    res.render("logout");
  }else{
    res.render("login")
  }
});

app.get("/", isAuthenticated, (req, res)=>{
  res.render("logout"); 
});

app.post("/login",async (req, res)=>{
  const {name, email} = req.body;

  const user = await User.create({
    name, email,
  });

  const cookieValue = Jwt.sign({_id: user._id}, "qwertyuiop");

  res.cookie("cookieName", cookieValue, {
    expires: new Date(Date.now()+90*1000), // 15 minutes
    httpOnly: true, // Cookie will not be accessible to JavaScript
  });
  res.redirect("/");
});


app.get("/logout", (req, res)=>{
  res.cookie("cookieName", null, {
    expires: new Date(Date.now()), // 15 minutes
    httpOnly: true, // Cookie will not be accessible to JavaScript
  });
  res.redirect("/");
})


app.listen(3000, () => {
  console.log("server is running");
});
