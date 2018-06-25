const mongoose = require("mongoose");
const passport = require('passport');
const passportConf = require('../../passport');
const Visit = require("../models/visit");
const Patient = require("../models/patient");
const FilesUploaded = require("../models/files_uploaded");
const helpers_log = require("../helpers/logsHelpers");


// add visit
exports.add_visit = (req, res, next) => {
    passport.authenticate('jwt', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            helpers_log.all_log(req, res, "Authorization failed");
            return res.json({
                status: "1",
                message: "Authorization failed"
            });
        }
        Patient.findOne({_id: req.body.patient_id})
            .exec()
            .then(patient => {
                if (!patient) {
                    helpers_log.all_log(req, res, `No found the Patient with ID : ${patient._id} `);
                    return  res.status(401).json({
                        status:"3",
                        message: `No found the Patient with ID : ${patient._id} `
                    });
                }else{
                    var last_id;

                    FilesUploaded.findOne().sort({created_at: -1}).exec(function (err, file_res) {
                        if (file_res == null) {
                            last_id = 0;

                        } else {
                            last_id = file_res['fileId'];
                        }

                        const files = new FilesUploaded({
                            _id: new mongoose.Types.ObjectId(),
                            fileId: last_id + 1,
                            originalname: req.file.originalname,
                            filename:req.file.filename,
                            mimetype: req.file.mimetype,
                            destination: req.file.destination,
                            path: req.file.path,
                            size: req.file.size,
                        });
                        files.save();
                        helpers_log.TransactionLog(req, res, "uploaded is Successfully");

                        const visit = new Visit({
                            _id: new mongoose.Types.ObjectId(),
                            
                            visitorName: req.body.visitorName,
                            patient_id:patient._id,
                            date: req.body.date,
                            comment: req.body.comment,
                             image_id:files._id,
                             image: files.fileId,
                        });
                        visit
                            .save()
                            .then(result => {
                                helpers_log.TransactionLog(req, res, "Visit Added");
                                visit.image = files.path;
                                res.status(201).json({
                                    status: "0",
                                    message: "Visit Added",
                                    data:{ visit, patient}
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
                }
            })
            .catch(err => {
            helpers_log.all_log(req, res, err.message);
            res.status(500).json({
                status: "2",
                error: err.message
            });
        });

    })(req, res, next);

};


// get one visit by id
exports.get_visit = (req, res, next) => {

    passport.authenticate('jwt', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            helpers_log.all_log(req, res, "Authorization failed");
            return res.json({
                status: "1",
                message: "Authorization failed"
            });
        }

        // console.log(req.params);
        Patient.findOne({_id: req.params.visitId})
            .exec()
            .then(doc => {
                if (doc.delete == 'true') {
                    helpers_log.all_log(req, res, `No found the Patient with ID : ${doc._id} `);
                    res.status(404).json({
                        status: "3",
                        message: `No found the Patient with ID : ${doc._id} `
                    });
                } else {

                    Visit.findOne({patientId:doc._id})
                        .exec()
                        .then(visit => {
                            let patient = doc;
                            FilesUploaded.findOne({fileId:visit.visitImg})
                                .exec()
                                .then(files => {
                                    visit.visitImg = files.path;
                                    helpers_log.TransactionLog(req, res);
                                    res.status(200).json({
                                        status: "0",
                                        data: {visit, patient},
                                    });
                                })
                        })
                }

            })
            .catch(err => {
                helpers_log.all_log(req, res, err.message);
                res.status(500).json({status: "2", error: err.message});
            });
    })(req, res, next);
};


// get all visits
exports.get_all_visit = (req, res, next) => {

    passport.authenticate('jwt', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            helpers_log.all_log(req, res, "Authorization failed");
            return res.json({
                status: "1",
                message: "Authorization failed"
            });
        }

        Visit.find({delete: {$ne: "true"}})
            .exec()
            .then(docs => {
                helpers_log.TransactionLog(req, res);
                const response = {
                    status: "0",
                    count: docs.length,
                    visits: docs.map(doc => {
                        return {
                            _id: doc._id,
                            visitorName: doc.visitorName,
                            patientId: doc.patientId,
                            date: doc.date,
                            comment: doc.comment,
                            image: doc.image,
                            delete: doc.delete,
                        };
                    })
                };
                if (docs.length != []) {
                    res.status(200).json(response);
                } else {
                    helpers_log.all_log(req, res, 'No Visits found');
                    res.status(404).json({
                        status: "3",
                        message: 'No Visits found'
                    });
                }
            })
            .catch(err => {
                helpers_log.all_log(req, res, err.message);
                res.status(500).json({status: "2", error: err.message});
            });
    })(req, res, next);
};

