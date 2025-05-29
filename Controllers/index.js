const Auth = require("../models/authModel");
const bcrypt = require("bcryptjs");
const { findUser } = require("../service"); 



const handleGetAllUsers = async (req, res) => {

  console.log(req.user);

    const allUser = await Auth.find() // or findUser()
    
    // res.status(200).json({
    //     message: "All users fetched successfully",
    //     allUser
    // })
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
    };










module.exports = {
    handleGetAllUsers,
    handleUserRegistration

}
 
