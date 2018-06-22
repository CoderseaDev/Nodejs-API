const express = require("express");
const router = express.Router();
const VisitController = require('../controllers/visits');


router.post("/addNewVisit", VisitController.add_new_visit);

router.get("/:visitId", VisitController.get_visit) ;

module.exports = router;