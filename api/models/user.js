const mongoose = require('mongoose');
const Joi = require('joi');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {
        type: String,
        required: true,
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password: { type: String, required: true }
});

// const userSchema = Joi.object().keys({
//     _id: mongoose.Schema.Types.ObjectId,
//     email: Joi.string().email().required(),
//     password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
// });

module.exports = mongoose.model('User', userSchema);