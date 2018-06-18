const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Tokens = require("../models/tokens");
const helpers_log = require("../helpers/logsHelpers");


signToken = user => {
    return jwt.sign({
        iss: 'Codersea',
        sub: user._id,
        iat: new Date().getTime(), // current time
        exp: new Date().setDate(new Date().getDate() + 1) // current time + 1 day ahead
    }, process.env.JWT_KEY);
}

exports.user_signup = (req, res, next) => {
    User.find({email: req.body.email})
        .exec()
        .then(user => {
            if (user.length >= 1) {
                helpers_log.all_log(req, res, "Mail exists");
                return res.status(409).json({
                    message: "Mail exists"
                });
            } else {
                if (req.body.password == '') {
                    helpers_log.all_log(req, res, 'password is required');
                    return res.status(500).json({
                        error: 'password is required'
                    });
                }
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {

                        return res.status(500).json({
                            error: 'password is required'
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });
                        user
                            .save()
                            .then(result => {
                                helpers_log.TransactionLog(req, res, "User created");
                                res.status(201).json({
                                    message: "User created"
                                });
                            })
                            .catch(err => {
                                helpers_log.all_log(req, res, err.message);
                                res.status(500).json({
                                    error: err.message
                                });
                            });
                    }
                });
            }
        });
};

exports.user_signin = (req, res, next) => {
    User.findOne({email: req.body.email})
        .exec()
        .then(user => {
            if (!user) {
                helpers_log.all_log(req, res, "Sorry, You Are not A User");
                return  res.status(401).json({
                    status:"3",
                    message: "Sorry, you are not a user"
                });
            }
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (!result) {
                    res.status(401).json({
                        status:"2",
                        message: "You entered wrong password"
                    });
                } else {
                    console.log(user[0]);
                    const token = signToken(user);
                    const Token = new Tokens({
                        _id: new mongoose.Types.ObjectId(),
                        token: token,
                        user_id: user._id
                    });
                    Token.save();
                    helpers_log.TransactionLog(req, res, "Auth successfully");
                    res.status(200).json({
                        status:"0",
                        message: "Auth successfully",
                        token: token,
                        userId: user._id
                    });

                }
            });
        })
        .catch(err => {
            helpers_log.all_log(req, res, err.message);
            res.status(500).json({
                error: err.message
            });
        });
};

exports.user_delete = (req, res, next) => {
    User.remove({_id: req.params.userId})
        .exec()
        .then(result => {
            helpers_log.TransactionLog(req, res, "User deleted");
            res.status(200).json({
                message: "User deleted"
            });
        })
        .catch(err => {
             helpers_log.all_log(req, res, err.message);
            res.status(500).json({
                error: err.message
            });
        });
};