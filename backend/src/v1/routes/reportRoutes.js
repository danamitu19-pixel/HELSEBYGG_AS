const express = require('express');
const router = express.Router();

const {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
} = require('../controllers/reportController');

const { authenticateToken, authorizeRoles } = require('../middelware/authMiddleware');
const { verifySubmissionToken } = require('../middelware/submissionMiddleware');

// Create: requires SUBMISSION token (not session). Keeps the report
// unlinkable to the user that posted it.
router.post('/', verifySubmissionToken, createReport);

// Read + status-update: management only (manager/admin session JWT).
router.get('/',               authenticateToken, authorizeRoles('manager', 'admin'), getAllReports);
router.get('/:id(\\d+)',       authenticateToken, authorizeRoles('manager', 'admin'), getReportById);
router.put('/:id(\\d+)',       authenticateToken, authorizeRoles('manager', 'admin'), updateReport);

// NOTE: no DELETE - helsebygg_reports_app has no DELETE grant.

module.exports = router;
