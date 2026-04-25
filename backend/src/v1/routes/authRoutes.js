const express = require('express');
const { register, login, logout } = require('../controllers/authController');
const { authenticateToken, authorizeRoles } = require('../middelware/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/register', authenticateToken, authorizeRoles('admin'), register);

module.exports = router;
