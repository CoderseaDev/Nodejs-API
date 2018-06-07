const mongoose = require("mongoose");
const ip = require("ip");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const TransactionLogs = require("../models/transaction_logs");
const Tokens = require("../models/tokens");

exports.user_signup = (req, res, next) => {
    User.find({email: req.body.email})
        .exec()
        .then(user => {
            if (user.length >= 1) {
                const TransactLog = new TransactionLogs({
                    _id: new mongoose.Types.ObjectId(),
                    url: req.protocol + '://' + req.get('host') + req.originalUrl,
                    method: req.method,
                    userIp: ip.address(),
                    status: 409,
                    message: "Mail exists"
                });
                TransactLog.save();
                return res.status(409).json({
                    message: "Mail exists"
                });
            } else {
                if(req.body.password != ''){
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
                                    const TransactLog = new TransactionLogs({
                                        _id: new mongoose.Types.ObjectId(),
                                        url: req.protocol + '://' + req.get('host') + req.originalUrl,
                                        method: req.method,
                                        userIp: ip.address(),
                                        status: res.statusCode,
                                    });
                                    TransactLog.save();
                                    console.log(result);
                                    res.status(201).json({
                                        message: "User created"
                                    });
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(500).json({
                                        error: err
                                    });
                                });
                        }
                    });
                }else {
                    return res.status(500).json({
                        error: 'password is required'
                    });
                }

            }
        });
};

exports.user_signin = (req, res, next) => {
    User.find({email: req.body.email})
        .exec()
        .then(user => {
            if (user.length < 1) {
                res.status(401).json({
                    message: "Auth failed"
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    res.status(401).json({
                        message: "Auth failed"
                    });
                }
                if (result) {
                    const token = jwt.sign(
                        {
                            email: user[0].email,
                            userId: user[0]._id
                        },
                        "secret",
                        {
                            expiresIn: "1h"
                        }
                    );
                    const Token = new Tokens({
                        _id: new mongoose.Types.ObjectId(),
                        token: token,
                        user_id:user[0]._id
                    });
                    Token.save();
                    res.status(200).json({
                        message: "Auth successful",
                        token: token,
                        userId: user[0]._id
                    });

                }
                res.status(401).json({
                    message: "Auth failed"
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.user_delete = (req, res, next) => {
    User.remove({_id: req.params.userId})
        .exec()
        .then(result => {
            const TransactLog = new TransactionLogs({
                _id: new mongoose.Types.ObjectId(),
                url: req.protocol + '://' + req.get('host') + req.originalUrl,
                method: req.method,
                userIp: ip.address(),
                status: res.statusCode,
            });
            TransactLog.save();
            res.status(200).json({
                message: "User deleted"
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};