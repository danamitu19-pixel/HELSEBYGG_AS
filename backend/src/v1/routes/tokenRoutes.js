const express = require('express');
const { issueSubmissionToken } = require('../controllers/tokenController');
const { authenticateToken, authorizeRoles } = require('../middelware/authMiddleware');

const router = express.Router();

// Any authenticated user can request a submission token.
router.post(
  '/submission-token',
  authenticateToken,
  authorizeRoles('employee', 'manager', 'admin'),
  issueSubmissionToken
);

module.exports = router;
