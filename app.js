const express = require("express");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const auth = require("./middleware/auth.js");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
dotenv.config();
require("./config/database");

const app = express();
app.use(cookieParser());
// mongoose

mongoose
  .connect(process.env.MONGO_URL)
  .then(console.log("db connected succesfully"))
  .catch((err) => {
    console.log("db connection failed");
    console.log(err);
    process.exit(1);
  });

// model related
const User = require("./model/user");
app.use(express.json());

// get routes
app.get("/", async (req, res) => {
  res.send("hello world from auth system");
});

// register route
app.post("/register", async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!(email && password && firstname && lastname)) {
      res.status(400).send(" all fields are required");
    }

    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      res.status(401).send("user already exists");
    }

    const encPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstname,
      lastname,
      email: email.toLowerCase(),
      password: encPassword,
    });

    // token
    const token = jwt.sign({ user_id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "2h",
    });

    user.token = token;
    // update in database or not

    //handle password situation
    user.password = undefined;

    res.status(201).json(user);
  } catch (e) {
    console.log(e);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).send("need to give all information");
    }
    const user = await User.findOne({ email: email });

    if (!user) {
      res.status(400).send("you are not resgistered with us");
    }

    //  await bcrypt.compare(password , user.password)
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ user_id: user._id }, process.env.SECRET_KEY, {
        expiresIn: "2h",
      });
      user.token = token;
      user.password = undefined;
      // res.status(200).json(user);

      // if you want to use cookies
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.status(200).cookie("token", token, options).json({
        success: true,
        token,
        user,
      });
    }
    res.status(400).send("email or password incorrect");
  } catch (e) {
    console.log(e);
  }
});

app.get("/dashboard", auth, (req, res) => {
  res.send("welcome to your dashboard");
});

module.exports = app;
