const mongoose = require("mongoose");
const ip = require("ip");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const TransactionLogs = require("../models/transaction_logs");
const Tokens = require("../models/tokens");
const Logs = require("../models/logs");

// All logs
function all_log(req, res) {
    const log = new Logs({
        _id: new mongoose.Types.ObjectId(),
        url: req.originalUrl,
        method: req.method,
        userIp: ip.address(),
        status: res.statusCode,
        message: err.message
    });
    log.save();
}

// All Transaction Logs
function TransactionLog(req, res) {
    const Transaction = new TransactionLogs({
        _id: new mongoose.Types.ObjectId(),
        url: req.originalUrl,
        method: req.method,
        userIp: ip.address(),
        status: res.statusCode,
    });
    Transaction.save();
}


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
                const TransactLog = new TransactionLogs({
                    _id: new mongoose.Types.ObjectId(),
                    url: req.originalUrl,
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
                if (req.body.password == '') {
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
                                TransactionLog(req, res);
                                res.status(201).json({
                                    message: "User created"
                                });
                            })
                            .catch(err => {
                                all_log(req, res);
                                res.status(500).json({
                                    error: err
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
            console.log(user);
            if (user.length < 1) {
                res.status(401).json({
                    message: "Auth failed"
                });
            }
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (err) {
                    res.status(401).json({
                        message: "password failed"
                    });
                } else {
                    console.log(user[0]);
                    const token = signToken(user);
                    TransactionLog(req, res);
                    const Token = new Tokens({
                        _id: new mongoose.Types.ObjectId(),
                        token: token,
                        user_id: user._id
                    });
                    Token.save();
                    res.status(200).json({
                        message: "Auth successfully",
                        token: token,
                        userId: user._id
                    });

                }
            });
        })
        .catch(err => {
            all_log(req, res);
            res.status(500).json({
                error: err
            });
        });
};

exports.user_delete = (req, res, next) => {
    User.remove({_id: req.params.userId})
        .exec()
        .then(result => {
            TransactionLog(req, res);
            res.status(200).json({
                message: "User deleted"
            });
        })
        .catch(err => {
            all_log(req, res);
            res.status(500).json({
                error: err
            });
        });
};