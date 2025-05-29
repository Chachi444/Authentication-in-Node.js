const jwt = require("jsonwebtoken");
const Auth = require("../models/authModel");
const bcrypt = require("bcryptjs");
const { findUser } = require("../service"); 



const handleGetAllUsers = async (req, res) => {

  console.log(req.user);

    const allUser = await Auth.find() // or findUser()
    
    res.status(200).json({
       message: "All users fetched successfully",
       allUser
  })
}

const handleUserRegistration =  async (req, res) => {
      try {
        const { email, firstName, lastName, password, state } = req.body;
    
        // Validation
        if (!email || typeof email !== "string") {
          return res.status(400).json({ message: "Invalid or missing email" });
        }
        if (!firstName || typeof firstName !== "string") {
          return res.status(400).json({ message: "Invalid or missing first name" });
        }
        if (!lastName || typeof lastName !== "string") {
          return res.status(400).json({ message: "Invalid or missing last name" });
        }
        if (!password || typeof password !== "string") {
          return res.status(400).json({ message: "Invalid or missing password" });
        }
        if (!state || typeof state !== "string") {
          return res.status(400).json({ message: "Invalid or missing state" });
        }
    
        // Check if user already exists
        const existingUser = await Auth.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: "User already exists" });
        }
    
        //Password length validation
        if (password.length < 6) {
          return res
            .status(400)
            .json({ message: "Password must be at least 6 characters long" });
        }
    
        const hashedPassword = await bcrypt.hash(password, 12);
    
        const newUser = new Auth({
          email,
          firstName,
          lastName,
          password: hashedPassword,
          state,
        });
    
        await newUser.save();
    
        res.status(201).json({
          message: "Success",
          newUser: {
            email,
            firstName,
            lastName,
            state,
          },
        });
      } catch (error) {
        res.status(500).json({
          message: "Error connecting to MongoDB",
          error: error.message,
        });
      }
}

const handleUserLogin = async (req, res) => {
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
      refresh_token, //refreshToken
    });
  }

const handleForgotPassword = async (req, res) => {
  const { email} = req.body;

  const user = await Auth.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Send the user a mail with the token

  const accessToken = jwt.sign(
    {user},
    process.env.ACCESS_TOKEN,
    { expiresIn: "5h" },
  )
  

  await sendForgotPasswordEmail(email, accessToken)// <-- Send the email with the token

  // Send OTP to the user

  res.status(200).json({ message: "Check Your mail"});
}


const handleResetPassword =  async (req, res) => { 

  const { password } = req.body; 

  const user = await Auth.findOne({ email: req.user.email }); 

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  user.password = hashedPassword;
  await user.save();

  res.status(200).json({ message: "Password reset successfully" });

}







module.exports = {
    handleGetAllUsers,
    handleUserRegistration,
    handleUserLogin,
    handleForgotPassword,
    handleResetPassword 

}
 
