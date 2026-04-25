const express = require('express');
// mergeParams so :reportId from the parent mount point is visible here.
const router = express.Router({ mergeParams: true });

const {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
} = require('../controllers/noteController');

const { authenticateToken, authorizeRoles } = require('../middelware/authMiddleware');

// Notes are entirely management-facing.
router.get('/',               authenticateToken, authorizeRoles('manager', 'admin'), getAllNotes);
router.get('/:id(\\d+)',       authenticateToken, authorizeRoles('manager', 'admin'), getNoteById);
router.post('/',              authenticateToken, authorizeRoles('manager', 'admin'), createNote);
router.put('/:id(\\d+)',       authenticateToken, authorizeRoles('manager', 'admin'), updateNote);

// NOTE: no DELETE - helsebygg_reports_app has no DELETE grant.

module.exports = router;
