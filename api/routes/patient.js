const express = require("express");
const passport = require('passport');
const passportConf = require('../../passport');
const router = express.Router();
const PatientController = require('../controllers/patients');
const passportSignIn = passport.authenticate('jwt', { session: false });
// const passportJWT = passport.authenticate('jwt', { session: false });

router.post("/addNewPatient", PatientController.add_new_patient);

module.exports = router;