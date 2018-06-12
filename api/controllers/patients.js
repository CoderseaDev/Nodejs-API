const mongoose = require("mongoose");
const ip = require("ip");
const Patient = require("../models/patient");
const TransactionLogs = require("../models/transaction_logs");
const passport = require('passport');
const passportConf = require('../../passport');

// add patient
exports.add_new_patient = (req, res, next) => {
    passport.authenticate('jwt', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.json({
                status: "1",
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
                    userIp: ip.address(),
                    method: req.method,
                    status: res.statusCode,
                });
                TransactLog.save();
                console.log(result);
                res.status(201).json({
                    status: "0",
                    message: "Patient Added"
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    status: "2",
                    error: err.message
                });
            });

    })(req, res, next);

};


// get one patient by id
exports.get_patient = (req, res, next) => {

    passport.authenticate('jwt', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.json({
                status: "1",
                message: "Authorization failed"
            });
        }

        const id = req.params.patientId;
        Patient.findById(id)
            .exec()
            .then(doc => {
                const TransactionLog = new TransactionLogs({
                    _id: new mongoose.Types.ObjectId(),
                    url: req.originalUrl,
                    method: req.method,
                    userIp: ip.address(),
                    status: res.statusCode,
                });
                TransactionLog.save();
                res.status(200).json({
                    status: "0",
                    patient: doc,
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({status: "2", error: err.message});
            });
    })(req, res, next);
};


// get all patients
exports.get_all_patient = (req, res, next) => {

    passport.authenticate('jwt', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.json({
                status: "1",
                message: "Authorization failed"
            });
        }

        Patient.find()
            .exec()
            .then(docs => {
                const TransactionLog = new TransactionLogs({
                    _id: new mongoose.Types.ObjectId(),
                    url: req.originalUrl,
                    method: req.method,
                    userIp: ip.address(),
                    status: res.statusCode,
                });
                TransactionLog.save();
                const response = {
                    status: "0",
                    count: docs.length,
                    patients: docs.map(doc => {
                        return {
                            _id: doc._id,
                            name: doc.name,
                            surname: doc.surname,
                            email: doc.email,
                            height: doc.height,
                            weight: doc.weight,
                            gender: doc.gender,
                            blood_type: doc.blood_type,
                            patient_complaint: doc.patient_complaint,
                            date_of_birth: doc.date_of_birth,
                            home_no: doc.home_no,
                            mobile_no: doc.mobile_no,
                            address: doc.address,
                            name_em: doc.name_em,
                            relation: doc.relation,
                            phone_no_em: doc.phone_no_em,
                        };
                    })
                };
                if (docs.length != []) {
                    res.status(200).json(response);
                } else {
                    res.status(404).json({
                        status: "3",
                        message: 'No Patients found'
                    });
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({status: "2", error: err.message});
            });
    })(req, res, next);
};


// update one patient by id
exports.update_patient = (req, res, next) => {

    passport.authenticate('jwt', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.json({
                status: "1",
                message: "Authorization failed"
            });
        }

        const id = req.params.patientId;
        const updateOps = {};
        for (const ops of req.body) {
            updateOps[ops.propName] = ops.value;
        }
        Patient.updateMany({_id: id}, {$set: updateOps})
            .exec()
            .then(result => {
                const TransactionLog = new TransactionLogs({
                    _id: new mongoose.Types.ObjectId(),
                    url: req.originalUrl,
                    method: req.method,
                    userIp: ip.address(),
                    status: res.statusCode,
                });
                TransactionLog.save();
                res.status(200).json({
                    status: "0",
                    message: 'Patient updated',
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({status: "2", error: err.message});
            });
    })(req, res, next);
};


// delete one product by id
exports.delete_patient = (req, res, next) => {
    passport.authenticate('jwt', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.json({
                status: "1",
                message: "Authorization failed"
            });
        }

        const id = req.params.patientId;
        updateOps = {delete: true};
        Patient.updateMany({_id: id}, {$set: updateOps})
            .exec()
            .then(result => {
                const TransactionLog = new TransactionLogs({
                    _id: new mongoose.Types.ObjectId(),
                    url: req.originalUrl,
                    method: req.method,
                    userIp: ip.address(),
                    status: res.statusCode,
                });
                TransactionLog.save();
                res.status(200).json({

                    message: 'Patient deleted',
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({status: "2", error: err.message});
            });
    })(req, res, next);
};
