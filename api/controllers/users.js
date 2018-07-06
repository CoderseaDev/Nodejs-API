const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Tokens = require("../models/tokens");
const helpers_log = require("../helpers/logsHelpers");


signToken = user => {

    var now = 	Math.round(new Date().getTime()/1000.0);
      var exp = now +(15 * 60);
   // console.log(t);
   // console.log(exp);
    return jwt.sign({
        iss: 'Codersea_access_token',
        sub: user._id,
        iat: new Date().getTime(), // current time
        exp: exp // current time + 1 day ahead
    }, process.env.JWT_KEY);
};
refreshToken = user => {

    var now = 	Math.round(new Date().getTime()/1000.0);
    var exp = now +(60 * 60 * 24)*30;
    // console.log(t);
    // console.log(exp);
    return jwt.sign({
        iss: 'Codersea_refresh_token',
        sub: user._id,
        iat: new Date().getTime(), // current time
        exp: exp // current time + 1 day ahead
    }, process.env.JWT_KEY);
};
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
                    const refreshtoken = refreshToken(user);
                         const tokenDecode = jwt.decode(token);
                      const  exp_date = tokenDecode.exp;
                    const Token = new Tokens({
                        _id: new mongoose.Types.ObjectId(),
                        token: token,
                        refreshToken:refreshtoken,
                        expiresIn : exp_date,
                        user_id: user._id
                    });
                    Token.save();
                    helpers_log.TransactionLog(req, res, "Auth successfully");
                    res.status(200).json({
                        status:"0",
                        message: "Auth successfully",
                        token: token,
                        refreshToken:refreshtoken,
                        expiresIn : exp_date,
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