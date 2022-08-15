const mongoose = require('mongoose');

let Registeruser = new mongoose.Schema({
    username:{
        type: "string",
        required: true
 },
 email:{
    type: "string",
    required: true,
    unique: true
 },
 password:{
    type: "string",
    required: true
},
confirmpassword:{
    type: "string",
    required: true
},
})

module.exports = mongoose.model('Registeruser', Registeruser)
