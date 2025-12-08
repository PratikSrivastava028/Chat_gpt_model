const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateLogin, validateRegister } = require('../middleware/validateAuth');

router.post('/register', validateRegister, authController.registerUser);
router.post('/login', validateLogin, authController.loginController);

module.exports = router;