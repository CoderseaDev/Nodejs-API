const express = require("express");
const passport = require('passport');
const passportConf = require('../../passport');
const router = express.Router();
const UserController = require('../controllers/users');
const checkAuth = require('../middleware/check-auth');
const { validateBody, schemas } = require('../helpers/routeUserHelpers');
const passportSignIn = passport.authenticate('jwt', { session: false },function (err,user,info) {
    console.log()
    if (err) { return next(err);}

});
// const passportJWT = passport.authenticate('jwt', { session: false });

router.post("/signup", validateBody(schemas.authSchema), UserController.user_signup);

router.post("/signin", validateBody(schemas.authSchema), UserController.user_signin);

router.delete("/:userId", checkAuth, UserController.user_delete);
router.get('/secret'
    , passportSignIn, (req, res, next) => {console.log('entered');});

module.exports = router;