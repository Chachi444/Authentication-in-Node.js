const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Auth = require("./models/authModel");
const cors = require("cors")
dotenv.config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const routes = require("./Routes")


 

const app = express();


app.use(express.json());
app.use(cors())

const PORT = process.env.PORT || 8080;


mongoose.connect(process.env.MONGODB_URL).then(() => {
  console.log("MongoDB connected");
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to my Server" });
});



app.use(routes)


// app.get("/users", async (req, res) => {
//   try {
//     const users = await Auth.find() //.select("-password");
//     res.status(200).json({ message: "Users", users });
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching users", error: error.message });
//   }
// })

