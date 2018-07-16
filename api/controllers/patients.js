const mongoose = require("mongoose");
const passport = require('passport');
const passportConf = require('../../passport');
const Patient = require("../models/patient");
const Visit =require("../models/visit");
const FilesUploaded = require("../models/files_uploaded");
const helpers_log = require("../helpers/logsHelpers");
let arr=[];


// add patient
exports.add_new_patient = (req, res, next) => {
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
        var last_id;
        Patient.findOne().sort({created_at: -1}).exec(function (err, post) {
            if (post == null) {
                last_id = 0;
            } else {
                last_id = post['patientId'];
            }
            let req_patient = JSON.stringify({
                patientName: req.body.patientName,
                email: req.body.email,
                surName: req.body.surName,
                height: req.body.height,
                weight: req.body.weight,
                gender: req.body.gender,
                bloodType: req.body.bloodType,
                complaint: req.body.complaint,
                date: req.body.date,
                homeNo: req.body.homeNo,
                mobileNo: req.body.mobileNo,
                address: req.body.address,
                contactName: req.body.contactName,
                contactRelationship: req.body.contactRelationship,
                contactPhoneNo: req.body.contactPhoneNo,
            });
            const patient = new Patient({
                _id: new mongoose.Types.ObjectId(),
                patientId: last_id + 1,
                patientName: req.body.patientName,
                email: req.body.email,
                surName: req.body.surName,
                height: req.body.height,
                weight: req.body.weight,
                gender: req.body.gender,
                bloodType: req.body.bloodType,
                complaint: req.body.complaint,
                date: req.body.date,
                homeNo: req.body.homeNo,
                mobileNo: req.body.mobileNo,
                address: req.body.address,
                contactName: req.body.contactName,
                contactRelationship: req.body.contactRelationship,
                contactPhoneNo: req.body.contactPhoneNo,
            });
            patient
                .save()
                .then(result => {
                    helpers_log.TransactionLog(req, res, "Patient Added");
                    helpers_log.all_log(req, res, "0","Patient Added",req_patient,patient);
                    res.status(200).json({
                        status: "0",
                        message: "Patient Added",
                        patient:patient
                    });
                })
                .catch(err => {
                    helpers_log.all_log(req, res, "2", err.message);
                    res.status(200).json({
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
            helpers_log.all_log(req, res, "1","Authorization failed");
            return res.json({
                status: "1",
                message: "Authorization failed"
            });
        }

        const id = req.params.patientId;
        
        Patient.findById(id)
            .exec()
            .then(doc => {
               
                if (doc.delete == 'true') {
                    helpers_log.all_log(req, res,"3", `No found the Patient with ID : ${doc._id} `,JSON.stringify({id : doc._id}));
                    res.status(200).json({
                        status: "3",
                        message: `No found the Patient with ID : ${doc._id} `
                    });
                } else {
                   
                    helpers_log.TransactionLog(req, res);
                    const p = doc;

                Visit.find({patient_id:p._id}).populate('image_id','path').exec().then(visits=>{
                    let res_patient =
                        JSON.stringify({
                            status: "0",
                            patient: p,
                            visits_info: visits.map(doc => {
                                return {
                                    _id: doc._id,
                                    visitorName: doc.visitorName,
                                    patient_id: doc.patient_id,
                                    date: doc.date,
                                    comment: doc.comment,
                                    image_info: doc.image_id,

                                }
                            })
                        });
                    helpers_log.all_log(req, res,"0", `Patient with ID : ${doc._id} `,JSON.stringify({id : doc._id}),res_patient);
                    res.status(200).json({
                            status: "0",
                            patient: p,
                            visits_info:visits.map(doc =>{
                                return {
                                    _id: doc._id,
                                    visitorName: doc.visitorName,
                                    patient_id: doc.patient_id,
                                    date: doc.date,
                                    comment: doc.comment,
                                    image_info:doc.image_id,
                                }
                            })
                        });
                    })
                }
            })
            .catch(err => {
                helpers_log.all_log(req, res, "2", err.message);
                res.status(200).json({status: "2", error: err.message});
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
            helpers_log.all_log(req, res, "1","Authorization failed");
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
                            patientName: doc.patientName,
                            surName: doc.surName,
                            email: doc.email,
                            height: doc.height,
                            weight: doc.weight,
                            gender: doc.gender,
                            bloodType: doc.bloodType,
                            complaint: doc.complaint,
                            date: doc.date,
                            homeNo: doc.homeNo,
                            mobileNo: doc.mobileNo,
                            address: doc.address,
                            contactName: doc.contactName,
                            contactRelationship: doc.contactRelationship,
                            contactPhoneNo: doc.contactPhoneNo,
                            delete: doc.delete
                        };
                    })
                };
                if (docs.length != []) {
                    helpers_log.all_log(req, res, "0","Get all patients successfully", "",JSON.stringify(response));
                    res.status(200).json(response);
                } else {
                    helpers_log.all_log(req, res, "3",'No Patients found');
                    res.status(200).json({
                        status: "3",
                        message: 'No Patients found'
                    });
                }
            })
            .catch(err => {
                helpers_log.all_log(req, res, "2",err.message);
                res.status(200).json({status: "2", error: err.message});
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
            helpers_log.all_log(req, res, "1","Authorization failed");
            return res.json({
                status: "1",
                message: "Authorization failed"
            });
        }
        const id = req.params.patientId;
        let update = req.body;
            update.updated_at = Date.now();

        Patient.updateMany({_id: id}, {$set: update} )
            .exec()
            .then(result => {
                helpers_log.TransactionLog(req, res, 'Patient updated');
                   Patient.findById(id).exec().then(result =>{
                      const patient =result;
                       let req_update_json = JSON.stringify({
                           _id: id,
                           update_data: update
                       });
                      let res_upadte_json =  JSON.stringify({
                          status: "0",
                          message: 'Patient updated',
                          patient:patient
                      });
                       helpers_log.all_log(req, res, "0","Patient updated",req_update_json, res_upadte_json);
                       res.status(200).json({
                           status: "0",
                           message: 'Patient updated',
                           patient:patient
                       });
                 });
            })
            .catch(err => {
                helpers_log.all_log(req, res, "2",err.message);
                res.status(200).json({status: "2", error: err.message});
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
            helpers_log.all_log(req, res, "1","Authorization failed");
            return res.json({
                status: "1",
                message: "Authorization failed"
            });
        }

        const id = req.params.patientId;
        updateOps = {delete: true ,deleted_at :Date.now()};
        Patient.updateMany({_id: id}, {$set: updateOps})
            .exec()
            .then(result => {
                helpers_log.TransactionLog(req, res, 'Patient deleted');
                let req_delete_json = JSON.stringify({_id: id});
                let res_delete_json = JSON.stringify({
                    status: "0",
                    message: 'Patient deleted',
                });
                helpers_log.all_log(req, res, "0","Patient deleted",req_delete_json, res_delete_json);
                res.status(200).json({
                    status: "0",
                    message: 'Patient deleted',
                });
            })
            .catch(err => {
                helpers_log.all_log(req, res, "2",err.message);
                res.status(200).json({status: "2", error: err.message});
            });
    })(req, res, next);
};
