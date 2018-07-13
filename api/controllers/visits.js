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
            helpers_log.all_log(req, res, "1","Authorization failed");
            return res.json({
                status: "1",
                message: "Authorization failed"
            });
        }
        Patient.findOne({_id: req.body.patient_id})
            .exec()
            .then(patient => {
                if (!patient) {
                    helpers_log.all_log(req, res, "3",`No found the Patient with ID : ${patient._id} `);
                    return res.status(200).json({
                        status: "3",
                        message: `No found the Patient with ID : ${patient._id} `
                    });
                } else {
                    var last_id;
                    FilesUploaded.findOne().sort({created_at: -1}).exec(function (err, file_res) {
                        if (file_res == null) {
                            last_id = 0;
                        } else {
                            last_id = file_res['fileId'];
                        }
                        console.log(req.file);
                        if (req.file === undefined) {
                            helpers_log.all_log(req, res, "2","No Image uploaded");
                            return res.status(200).json({
                                status: "2",
                                error: "No Image uploaded"
                            });
                        }
                        const files = new FilesUploaded({
                            _id: new mongoose.Types.ObjectId(),
                            fileId: last_id + 1,
                            originalname: req.file.originalname,
                            filename: req.file.filename,
                            mimetype: req.file.mimetype,
                            destination: req.file.destination,
                            path: req.file.path,
                            size: req.file.size,
                        });
                        files.save();
                        let res_files = JSON.stringify({_id: new mongoose.Types.ObjectId(),
                            fileId: last_id + 1,
                            originalname: req.file.originalname,
                            filename: req.file.filename,
                            mimetype: req.file.mimetype,
                            destination: req.file.destination,
                            path: req.file.path,
                            size: req.file.size});
                        helpers_log.TransactionLog(req, res, "uploaded is Successfully");
                        helpers_log.all_log(req, res, "0","uploaded is Successfully", "",res_files);
                        const visit = new Visit({
                            _id: new mongoose.Types.ObjectId(),
                            visitorName: req.body.visitorName,
                            patient_id: patient._id,
                            date: req.body.date,
                            comment: req.body.comment,
                            image_id: files._id,
                            image: files.fileId,
                        });
                        visit
                            .save()
                            .then(result => {
                                let req_visit_json = JSON.stringify({
                                    _id: new mongoose.Types.ObjectId(),
                                    visitorName: req.body.visitorName,
                                    patient_id: patient._id,
                                    date: req.body.date,
                                    comment: req.body.comment,
                                    image_id: files._id,
                                    image: files.fileId,
                                });
                                let res_visit_json = JSON.stringify({
                                    status: "0",
                                    message: "Visit Added",
                                    data: {visit, patient}
                                });
                                helpers_log.TransactionLog(req, res, "Visit Added");
                                helpers_log.all_log(req, res, "0","Visit Added", req_visit_json, res_visit_json);
                                visit.image = files.path;
                                res.status(201).json({
                                    status: "0",
                                    message: "Visit Added",
                                    data: {visit, patient}
                                });
                            })
                            .catch(err => {
                                helpers_log.all_log(req, res, "2",err.message);
                                res.status(200).json({
                                    status: "2",
                                    error: err.message
                                });
                            });
                    });
                }
            })
            .catch(err => {
                helpers_log.all_log(req, res, "2",err.message);
                res.status(200).json({
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
            helpers_log.all_log(req, res, "1","Authorization failed");
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
                    helpers_log.all_log(req, res, "3",`No found the Patient with ID : ${doc._id} `);
                    res.status(200).json({
                        status: "3",
                        message: `No found the Patient with ID : ${doc._id} `
                    });
                } else {
                    Visit.findOne({patientId: doc._id})
                        .exec()
                        .then(visit => {
                            let patient = doc;
                            FilesUploaded.findOne({fileId: visit.visitImg})
                                .exec()
                                .then(files => {
                                    visit.visitImg = files.path;
                                    let req_getvisit = JSON.stringify({patientId: doc._id});
                                    let res_getvisit = JSON.stringify({status: "0", data: {visit, patient}});
                                    helpers_log.TransactionLog(req, res);
                                    helpers_log.all_log(req, res, "0",`Get visit the Patient with ID : ${doc._id} `,req_getvisit,res_getvisit );
                                    res.status(200).json({
                                        status: "0",
                                        data: {visit, patient},
                                    });
                                })
                        })
                }
            })
            .catch(err => {
                helpers_log.all_log(req, res, "2",err.message);
                res.status(200).json({status: "2", error: err.message});
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
            helpers_log.all_log(req, res, "1","Authorization failed");
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
                    helpers_log.all_log(req, res, "0","Get all visits successfully","",JSON.stringify(response));
                    res.status(200).json(response);
                } else {
                    helpers_log.all_log(req, res, "3",'No Visits found');
                    res.status(200).json({
                        status: "3",
                        message: 'No Visits found'
                    });
                }
            })
            .catch(err => {
                helpers_log.all_log(req, res,"2", err.message);
                res.status(200).json({status: "2", error: err.message});
            });
    })(req, res, next);
};

