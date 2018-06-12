const mongoose = require("mongoose");
const Patient = require("../models/patient");
const TransactionLogs = require("../models/transaction_logs");
const passport = require('passport');
const passportConf = require('../../passport');
exports.add_new_patient = (req, res, next) => {
    passport.authenticate('jwt', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
          //  console.log("yuyuy");
            return res.json({
                status:"1",
                message: "Authorization failed"
            });
        }

        const patient = new Patient({
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            email: req.body.email,
            surname: req.body.surname,
            height: req.body.height,
            weight: req.body.weight,
            gender: req.body.gender,
            blood_type: req.body.blood_type,
            patient_complaint: req.body.patient_complaint,
            date_of_birth: req.body.date_of_birth,
            home_no: req.body.home_no,
            mobile_no: req.body.mobile_no,
            address: req.body.address,
            name_em: req.body.name_em,
            relation: req.body.relation,
            phone_no_em: req.body.phone_no_em,
        });
        patient
            .save()
            .then(result => {
                const TransactLog = new TransactionLogs({
                    _id: new mongoose.Types.ObjectId(),
                    url: req.originalUrl,
                    method: req.method,
                    status: res.statusCode,
                });
                TransactLog.save();
                console.log(result);
                res.status(201).json({
                    status:"0",
                    message: "Patient Added"
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    status:"2",
                    error: err.message
                });
            });

    })(req, res, next);

};

