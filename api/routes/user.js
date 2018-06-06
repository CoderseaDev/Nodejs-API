const express = require("express");
const router = express.Router();
const UserController = require('../controllers/users');
const checkAuth = require('../middleware/check-auth');
const { validateBody, schemas } = require('../helpers/routeUserHelpers');

router.post("/signup", validateBody(schemas.authSchema), UserController.user_signup);

router.post("/signin", validateBody(schemas.authSchema), UserController.user_signin);

router.delete("/:userId", checkAuth, UserController.user_delete);

module.exports = router;