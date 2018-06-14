const mongoose = require("mongoose");
const ip = require("ip");
const passport = require('passport');
const passportConf = require('../../passport');
const Patient = require("../models/patient");
const helpers_log = require("../helpers/logsHelpers");


// add patient
exports.add_new_patient = (req, res, next) => {
    passport.authenticate('jwt', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            helpers_log.logWithMessage(req, res, "Authorization failed");
            return res.json({
                status: "1",
                message: "Authorization failed"
            });
        }
        var last_id;
        Patient.findOne().sort({created_at: -1}).exec(function (err, post) {
            if (post == null) {
                last_id = 0;
            } else {
                last_id = post['patientId'];
            }

            const patient = new Patient({
                _id: new mongoose.Types.ObjectId(),
                patientId: last_id + 1,
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
                    helpers_log.TransactionLog(req, res);
                    res.status(201).json({
                        status: "0",
                        message: "Patient Added"
                    });
                })
                .catch(err => {
                    helpers_log.all_log(req, res, err.message);
                    res.status(500).json({
                        status: "2",
                        error: err.message
                    });
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
            helpers_log.logWithMessage(req, res, "Authorization failed");
            return res.json({
                status: "1",
                message: "Authorization failed"
            });
        }

        const id = req.params.patientId;
        Patient.findById(id)
            .exec()
            .then(doc => {
                helpers_log.TransactionLog(req, res);
                if (doc.delete == 'true') {
                    res.status(404).json({
                        status: "3",
                        message: `No found the Patient with ID : ${doc._id} `
                    });
                } else {
                    res.status(200).json({
                        status: "0",
                        patient: doc,
                    });
                }

            })
            .catch(err => {
                helpers_log.all_log(req, res, err.message);
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
            helpers_log.logWithMessage(req, res, "Authorization failed");
            return res.json({
                status: "1",
                message: "Authorization failed"
            });
        }

        Patient.find({delete: {$ne: "true"}})
            .exec()
            .then(docs => {
                helpers_log.TransactionLog(req, res);
                const response = {
                    status: "0",
                    count: docs.length,
                    patients: docs.map(doc => {
                        return {
                            _id: doc._id,
                            patientId: doc.patientId,
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
                            delete: doc.delete
                        };
                    })
                };
                if (docs.length != []) {
                    res.status(200).json(response);
                } else {
                    helpers_log.all_log(req, res, 'No Patients found');
                    res.status(404).json({
                        status: "3",
                        message: 'No Patients found'
                    });
                }
            })
            .catch(err => {
                helpers_log.all_log(req, res, err.message);
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
            helpers_log.logWithMessage(req, res, "Authorization failed");
            return res.json({
                status: "1",
                message: "Authorization failed"
            });
        }

        const id = req.params.patientId;
        Patient.updateMany({_id: id}, {$set: req.body})
            .exec()
            .then(result => {
                helpers_log.TransactionLog(req, res);
                res.status(200).json({
                    status: "0",
                    message: 'Patient updated',
                });
            })
            .catch(err => {
                helpers_log.all_log(req, res, err.message);
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
            helpers_log.logWithMessage(req, res, "Authorization failed");
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
                helpers_log.TransactionLog(req, res);
                res.status(200).json({
                    status: "0",
                    message: 'Patient deleted',
                });
            })
            .catch(err => {
                helpers_log.all_log(req, res, err.message);
                res.status(500).json({status: "2", error: err.message});
            });
    })(req, res, next);
};
