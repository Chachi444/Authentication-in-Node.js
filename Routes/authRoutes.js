const express = require('express');
// const jwt = require("jsonwebtoken");
const { handleForgotPassword, handleUserLogin, handleGetAllUsers, handleUserRegistration, handleResetPassword } = require('../Controllers');
const { authorization, validateRegistration } = require('../middleware');







const router = express.Router()

router.post("/login", handleUserLogin);

router.post("/forgot-password", handleForgotPassword);

router.patch("/reset-password", authorization, handleResetPassword);

router.post("/sign-up", validateRegistration, handleUserRegistration);

router.get ("/all-users",  authorization, handleGetAllUsers)






module.exports = router