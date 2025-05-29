const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Auth = require("./models/authModel");
dotenv.config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { handleGetAllUsers, handleUserRegistration } = require("./Controllers");
const { validateRegistration } = require("./middleware");
const { authorization } = require("./middleware");



const app = express();

app.use(express.json());

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

app.post("/sign-up", validateRegistration, handleUserRegistration);


app.get("/users", async (req, res) => {
  try {
    const users = await Auth.find() //.select("-password");
    res.status(200).json({ message: "Users", users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
})

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

   const user = await Auth.findOne({ email })  //.select("-password");

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  
  const isMatch = await bcrypt.compare(password, user?.password);
  

  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // if(!user.verified){
  //   return res.status(400).json({ message: "User not verified" })
  // }

  //Generate a token (verifying users before they can access account)
  const access_token = jwt.sign({ id: user?._id }, process.env.ACCESS_TOKEN, {
    expiresIn: "6h",
  });

  //refresh token
  const refresh_token = jwt.sign({ id: user?._id }, process.env.REFRESH_TOKEN, {
    expiresIn: "60d", //financial transactions should be 60s
  });

  res.status(200).json({
    message: "Login",
    access_token, //accessToken
    user: {
      email: user?.email,
      firstName: user?.firstName,
      lastName: user?.lastName,
      state: user?.state,
      role: user?.role,
    },
  });
});



app.post("/forgot-password", async (req, res) => {
  const { email} = req.body;

  const user = await Auth.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Send the user a mail with the token

  const accessToken = jwt.sign(
    {user},
    process.env.ACCESS_TOKEN,
    { expiresIn: "10m" },
  )
  

  await sendForgotPasswordEmail(email, accessToken)// <-- Send the email with the token

  // Send OTP to the user

  res.status(200).json({ message: "Check Your mail"});
}
);

//reset user password

app.patch("/reset-password", authorization, async (req, res) => { 

  const { password } = req.body; 

  const user = await Auth.findOne({ email: req.user.email }); 

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  user.password = hashedPassword;
  await user.save();

  res.status(200).json({ message: "Password reset successfully" });

})
  
// MVC - R
// Model Controller Routes

//Middleware / Authorization / Validations

// Deployment


app.get ("/all-users",  authorization, handleGetAllUsers)