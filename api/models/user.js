const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {type: String,},
    password: { type: String},
    refreshToken : {type:String,default:1}
},{collection: "users"} );

module.exports = mongoose.model('User', userSchema);