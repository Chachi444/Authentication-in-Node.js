const Auth = require("../models/authModel")



const findUser = async () =>{
    const allUsers = await Auth.find()      
    
    return allUsers;
}

module.exports   = {
    findUser
}